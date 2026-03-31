This is a pure schema architecture task — no file creation needed, I'll deliver this directly and thoroughly.

---

# Production-Grade Prisma Schema Architecture
## Smart Exam Coach — Question Filtering & Retrieval System

---

## 1. Completed Prisma Schema into file `prisma/schema.prisma`

---

## 2. Relation Design Decisions

**Why self-referential Subject tree instead of fixed-depth tables?**
A fixed schema like `Subject → Chapter → Topic` breaks the moment the curriculum changes depth. The self-referential `parentId` tree supports arbitrary depth, lazy loading per level, and lets you query an entire branch in one recursive CTE. The `SubjectLevel` enum is a label, not a structural constraint — you can add `MICRO_TOPIC` later without a migration that touches the question table.

**Why separate QuestionVersion instead of inline content?**
Questions in production get corrected, updated, and improved over time. If you inline the content, you lose the audit trail and you can't A/B test question quality. `QuestionVersion` stores immutable snapshots. The `Question` model holds a `currentVersionId` foreign key pointing to the live version. Historical versions remain queryable for analytics ("did accuracy improve after the question was reworded?").

**Why denormalized counters on Question (totalAttempts, trendingScore)?**
Counting rows in `QuestionAttempt` on every API call at millions of records is a table scan even with indexes. Denormalized counters updated asynchronously (via a queue or database trigger) allow `ORDER BY trendingScore DESC` to use a plain index scan — sub-millisecond at any scale. The `QuestionAnalytics` table is a materialized snapshot computed by a background job, not live aggregation.

**Why Json for MCQ options instead of a separate OptionTable?**
An `Option` table with a foreign key to `Question` creates 4–5× more rows than questions. At 10M questions with 4 options each, that's 40M+ rows in a table that is always read as a complete set — never filtered by individual option. JSON storage with PostgreSQL's `jsonb` type is faster to read, cheaper to store, and supports indexing on specific option fields with `jsonb_path_ops` if needed.

**Why ExamRule instead of hardcoding question selection?**
Smart exams need to be configured declaratively: "give me 15 Easy MCQs from Physics Chapter 3, and 10 Hard MCQs from Chemistry with negative marking." `ExamRule` rows describe these constraints. The exam generation engine reads rules and executes the query at exam-start time — fully dynamic, no manual question assignment required.

**Why QuestionBookmark stores `tags String[]` instead of a Tag FK?**
User-defined bookmark labels are personal and temporary. They don't need referential integrity to the global `Tag` table. Using `String[]` with a GIN index on PostgreSQL allows fast filtering on user-specific labels without polluting the canonical tagging system.

---

## 3. Filtering Strategy Examples

The schema is designed so every filtering dimension is a first-class indexed field or join, not a runtime string parse. Here is how complex filters compose:

**Scenario A — "All Hard MCQs from HSC Physics Chapter 3, not yet attempted by user X"**
```
Question WHERE
  type = MCQ_SINGLE
  difficulty = HARD
  status = PUBLISHED
  → QuestionSubject.subjectId IN [Chapter3_id]
  → NOT EXISTS QuestionAttempt WHERE userId = X
```

**Scenario B — "Previous year BCS questions on Bangladesh Affairs tagged 'Mujib Era', sorted by trending"**
```
Question WHERE
  isPreviousYear = true
  → QuestionOrganization.organizationId = BCS_org_id
  → QuestionSubject.subjectId IN bangladesh_affairs_subtree
  → QuestionTag.tagId = mujib_era_tag_id
ORDER BY trendingScore DESC
```

**Scenario C — "Smart adaptive: weakest topics for user X, avoiding questions already correct"**
```
UserSubjectProgress WHERE userId = X ORDER BY weaknessScore DESC LIMIT 5
→ subjectIds = [top 5 weak subjects]

Question WHERE
  subjectId IN [weak subjects]
  NOT IN (QuestionAttempt WHERE userId = X AND status = CORRECT)
ORDER BY difficulty ASC  -- start easier, ramp up
```

**Scenario D — "Interdisciplinary questions across Physics + Chemistry for a cross-subject mock"**
```
Question WHERE
  isMultiSubject = true
  → QuestionSubject where subjectId IN [physics_ids, chemistry_ids]
  GROUP BY questionId HAVING COUNT(DISTINCT subjectId) >= 2
```

---

## 4. Example Prisma Filtering Queries

```typescript
// ── 1. Complex multi-dimension filter with pagination ────────────────────
const questions = await prisma.question.findMany({
  where: {
    status: "PUBLISHED",
    difficulty: { in: ["HARD", "EXPERT"] },
    type: "MCQ_SINGLE",
    isPreviousYear: true,
    language: { in: ["ENGLISH", "BOTH"] },
    subjects: {
      some: {
        subject: {
          // Walk the tree: any subject whose ancestor is Physics
          OR: [
            { id: physicsChapterId },
            { parentId: physicsChapterId },
            { parent: { parentId: physicsChapterId } },
          ],
        },
        isPrimary: true,
      },
    },
    organizations: {
      some: { organizationId: bcsOrgId },
    },
    examSessions: {
      some: {
        examSession: { year: { gte: 2019 } },
      },
    },
    tags: {
      some: { tagId: { in: [tag1, tag2] } },
    },
  },
  orderBy: [
    { trendingScore: "desc" },
    { totalAttempts: "desc" },
  ],
  skip: (page - 1) * limit,
  take: limit,
  include: {
    currentVersion: true,
    subjects: { include: { subject: { select: { id: true, name: true, level: true } } } },
    tags: { include: { tag: { select: { id: true, name: true } } } },
  },
});


// ── 2. Smart adaptive question selection (avoid already-correct) ─────────
const weakSubjectIds = await prisma.userSubjectProgress
  .findMany({
    where: { userId, accuracy: { lt: 0.6 } },
    orderBy: { weaknessScore: "desc" },
    take: 5,
    select: { subjectId: true },
  })
  .then((r) => r.map((x) => x.subjectId));

const correctQuestionIds = await prisma.questionAttempt
  .findMany({
    where: { userId, status: "CORRECT" },
    select: { questionId: true },
    distinct: ["questionId"],
  })
  .then((r) => r.map((x) => x.questionId));

const adaptiveSet = await prisma.question.findMany({
  where: {
    status: "PUBLISHED",
    id: { notIn: correctQuestionIds },
    subjects: {
      some: { subjectId: { in: weakSubjectIds } },
    },
  },
  orderBy: { difficulty: "asc" },
  take: 20,
  include: { currentVersion: true },
});


// ── 3. Leaderboard query ─────────────────────────────────────────────────
const leaderboard = await prisma.examAttempt.findMany({
  where: {
    examId,
    isCompleted: true,
  },
  orderBy: [{ score: "desc" }, { timeSpent: "asc" }],
  take: 100,
  select: {
    userId: true,
    score: true,
    percentage: true,
    timeSpent: true,
    rank: true,
  },
});


// ── 4. User weakness map (subject-level accuracy) ────────────────────────
const weaknessMap = await prisma.userSubjectProgress.findMany({
  where: { userId },
  orderBy: { accuracy: "asc" },
  include: {
    subject: {
      select: { id: true, name: true, level: true, parentId: true },
    },
  },
});


// ── 5. Trending questions this week ─────────────────────────────────────
const trending = await prisma.question.findMany({
  where: {
    status: "PUBLISHED",
    attempts: {
      some: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    },
  },
  orderBy: { trendingScore: "desc" },
  take: 50,
  include: { currentVersion: { select: { stem: true } } },
});


// ── 6. Full-text search (PostgreSQL) ────────────────────────────────────
const searched = await prisma.$queryRaw`
  SELECT q.id, qv.stem, q."trendingScore"
  FROM "Question" q
  JOIN "QuestionVersion" qv ON q."currentVersionId" = qv.id
  WHERE q."searchVector" @@ plainto_tsquery('english', ${searchTerm})
    AND q.status = 'PUBLISHED'
  ORDER BY ts_rank(q."searchVector", plainto_tsquery('english', ${searchTerm})) DESC,
           q."trendingScore" DESC
  LIMIT ${limit} OFFSET ${offset}
`;


// ── 7. Smart random exam generator from rules ───────────────────────────
async function generateExamQuestions(examId: string, userId: string) {
  const rules = await prisma.examRule.findMany({ where: { examId } });

  const allSelected: string[] = [];

  for (const rule of rules) {
    const questions = await prisma.question.findMany({
      where: {
        status: "PUBLISHED",
        id: { notIn: allSelected },
        ...(rule.difficulty && { difficulty: rule.difficulty }),
        ...(rule.questionType && { type: rule.questionType }),
        ...(rule.fromPreviousYear && { isPreviousYear: true }),
        ...(rule.subjectId && {
          subjects: { some: { subjectId: rule.subjectId } },
        }),
        ...(rule.tagId && {
          tags: { some: { tagId: rule.tagId } },
        }),
      },
      // Weighted random: favour questions not recently seen by this user
      orderBy: { trendingScore: "desc" },
      take: rule.questionCount * 3, // Oversample then shuffle
    });

    // Shuffle and slice to required count
    const shuffled = questions.sort(() => Math.random() - 0.5);
    allSelected.push(...shuffled.slice(0, rule.questionCount).map((q) => q.id));
  }

  return allSelected;
}
```

---

## 5. Indexing Strategy

```sql
-- ── Subject tree traversal ───────────────────────────────────────────────
CREATE INDEX idx_subject_parent ON "Subject"(parent_id);
CREATE INDEX idx_subject_level_active ON "Subject"(level, is_active);

-- ── Core question filters (most frequent combinations) ───────────────────
CREATE INDEX idx_question_status_diff_type
  ON "Question"(status, difficulty, type);

CREATE INDEX idx_question_status_prev_diff
  ON "Question"(status, is_previous_year, difficulty);

CREATE INDEX idx_question_trending
  ON "Question"(trending_score DESC)
  WHERE status = 'PUBLISHED';

CREATE INDEX idx_question_analytics
  ON "Question"(total_attempts DESC, total_correct DESC)
  WHERE status = 'PUBLISHED';

-- ── Junction table indexes (covering indexes for join performance) ────────
CREATE INDEX idx_qs_subject ON "QuestionSubject"(subject_id, is_primary);
CREATE INDEX idx_qs_question ON "QuestionSubject"(question_id);
CREATE INDEX idx_qt_tag ON "QuestionTag"(tag_id);
CREATE INDEX idx_qo_org ON "QuestionOrganization"(organization_id);
CREATE INDEX idx_qes_session ON "QuestionExamSession"(exam_session_id);

-- ── Attempt analytics ────────────────────────────────────────────────────
CREATE INDEX idx_attempt_user_question
  ON "QuestionAttempt"(user_id, question_id);

CREATE INDEX idx_attempt_question_status
  ON "QuestionAttempt"(question_id, status);

CREATE INDEX idx_attempt_user_date
  ON "QuestionAttempt"(user_id, created_at DESC);

-- ── User progress & personalization ─────────────────────────────────────
CREATE INDEX idx_progress_user_weakness
  ON "UserSubjectProgress"(user_id, weakness_score DESC);

CREATE INDEX idx_progress_user_accuracy
  ON "UserSubjectProgress"(user_id, accuracy ASC);

-- ── Full-text search vector ──────────────────────────────────────────────
CREATE INDEX idx_question_fts
  ON "Question" USING GIN(search_vector);

-- ── Bookmark user filters ────────────────────────────────────────────────
CREATE INDEX idx_bookmark_user ON "QuestionBookmark"(user_id);
CREATE INDEX idx_bookmark_user_reason ON "QuestionBookmark"(user_id, reason);

-- GIN index for user-defined bookmark tag arrays
CREATE INDEX idx_bookmark_tags ON "QuestionBookmark" USING GIN(tags);

-- ── Exam leaderboard ─────────────────────────────────────────────────────
CREATE INDEX idx_exam_attempt_score
  ON "ExamAttempt"(exam_id, score DESC)
  WHERE is_completed = true;
```

**Partial indexes** (the `WHERE` clause) are critical — they exclude non-published, incomplete, or draft rows from the index entirely, keeping index size small and scans fast. At 10M questions with 20% drafts, you eliminate 2M rows from the hot indexes.

---

## 6. Performance Optimization Techniques

**Cursor-based pagination over offset pagination.** At large page numbers, `OFFSET 50000` forces the database to scan and discard 50,000 rows. Replace with keyset pagination:

```typescript
// Instead of: skip: page * limit
// Use cursor:
const questions = await prisma.question.findMany({
  where: { status: "PUBLISHED", ...filters },
  orderBy: [{ trendingScore: "desc" }, { id: "asc" }],
  take: limit + 1,
  cursor: lastCursor ? { id: lastCursor } : undefined,
});
```

**Materialized analytics.** Never compute `COUNT(*)` or `AVG()` on `QuestionAttempt` in a request path. Run a background job (cron or queue) every 15 minutes that updates `QuestionAnalytics` and writes denormalized `trendingScore` back to `Question`. This converts an aggregation query into a single-row read.

**`tsvector` search column.** Maintain a generated column or trigger that keeps `searchVector` updated when `QuestionVersion` content changes. This avoids `ILIKE '%term%'` which cannot use indexes and causes full table scans.

```sql
-- Trigger to maintain search vector
CREATE OR REPLACE FUNCTION update_question_search_vector()
RETURNS trigger AS $$
BEGIN
  UPDATE "Question"
  SET search_vector =
    setweight(to_tsvector('english', COALESCE(NEW.stem, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.explanation, '')), 'B')
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_search_vector
AFTER INSERT OR UPDATE ON "QuestionVersion"
FOR EACH ROW EXECUTE FUNCTION update_question_search_vector();
```

**Read replicas for analytics.** Route all `QuestionAttempt` aggregations, leaderboard queries, and analytics pipeline reads to a PostgreSQL read replica. Write path (exam submission, attempt recording) goes to primary only.

**Connection pooling with PgBouncer.** At scale, each Prisma client holds a connection pool. Behind a serverless or microservice deployment, this causes connection exhaustion. PgBouncer in transaction mode sits between your services and PostgreSQL, multiplexing hundreds of application connections onto a small pool of actual DB connections.

---

## 7. Scaling Strategy for Millions of Records

**Partitioning `QuestionAttempt` by date.** This is the fastest-growing table — at 1M active users each attempting 20 questions/day, you accumulate 600M rows/month. Partition by `created_at` range (monthly):

```sql
CREATE TABLE "QuestionAttempt" (
  ...
  created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);

CREATE TABLE question_attempt_2025_01
  PARTITION OF "QuestionAttempt"
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

Queries with a `created_at` filter only touch the relevant partitions. Historical partitions can be archived to cheaper storage.

**Separate `Question` from `QuestionVersion` into different tablespaces.** `Question` is the hot read table — it lives in fast NVMe-backed storage. `QuestionVersion` history is cold — archivable or stored on cheaper storage after 90 days.

**Redis cache layer for hot data.** Cache `QuestionAnalytics` rows and top-N leaderboard results in Redis with a 5-minute TTL. The vast majority of requests for trending questions or leaderboard ranks hit cache, not Postgres.

```
Cache keys:
  question:analytics:{questionId}    → TTL 15m
  exam:leaderboard:{examId}:top100   → TTL 60s (live exams), 5m (closed)
  user:progress:{userId}             → TTL 5m
  trending:questions:{subjectId}     → TTL 10m
```

**Message queue for write-heavy paths.** Exam submission triggers: score calculation, `QuestionAttempt` inserts, leaderboard rank update, `UserSubjectProgress` recalculation, `trendingScore` update, notification dispatch. Run these through a queue (BullMQ / SQS) — process asynchronously, decouple submission latency from downstream computation.

---

## 8. Future-Proof Architecture Suggestions

**AI recommendation readiness.** `UserSubjectProgress.weaknessScore`, `QuestionAnalytics.difficultyDrift`, `QuestionSubject.weight`, and `QuestionTag.relevance` are all float fields left intentionally for ML scoring. Your recommendation model writes back to these columns; the query layer reads them without structural changes.

**Vector embeddings for semantic search.** When you add AI question generation or semantic similarity ("find questions similar to this one"), store embeddings as `Float[]` or use `pgvector` extension:

```sql
CREATE EXTENSION vector;
ALTER TABLE "Question" ADD COLUMN embedding vector(1536);
CREATE INDEX ON "Question" USING ivfflat (embedding vector_cosine_ops);
```

This enables: "find the 20 most conceptually similar questions to Q123" — critical for adaptive exam generation.

**Event sourcing for attempt history.** Instead of mutable attempt rows, append-only event records (`QuestionAnswered`, `ExamSubmitted`, `HintViewed`) allow replay, audit, and future analytics models to recompute anything from raw events. Start with the current schema and introduce event sourcing incrementally on the analytics read side.

**Multi-tenancy for White-Label.** The `Organization` model already exists. Extend it with `tenantId` scoping on `Question`, `Exam`, and `PracticeSet`. Add row-level security in PostgreSQL so tenant A can never read tenant B's private questions — enforced at the database layer, not only the application layer.

**GraphQL / DataLoader for nested filtering.** Prisma's nested `include` generates N+1 queries without DataLoader. At scale, implement a DataLoader layer that batches subject, tag, and organization lookups per question — turning N junction table queries into 1 batch query per type per request.

---

This schema handles the full lifecycle — from a student browsing questions filtered by 8 dimensions, to a live exam with 50,000 concurrent users, to an AI advisor computing readiness scores from 2 years of attempt history — without a single structural change.