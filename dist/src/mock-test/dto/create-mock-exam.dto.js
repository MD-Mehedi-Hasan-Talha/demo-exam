"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMockExamDto = void 0;
const client_1 = require("@prisma/client");
class MockRuleInput {
    subjectId;
    tagId;
    difficulty;
    questionType;
    questionCount;
    marks;
    negMarks;
    fromPreviousYear;
}
class CreateMockExamDto {
    title;
    createdBy;
    mode = client_1.ExamMode.MOCK;
    totalDuration;
    totalMarks;
    passMark;
    organizationId;
    examSessionId;
    shuffleQuestions;
    rules;
}
exports.CreateMockExamDto = CreateMockExamDto;
//# sourceMappingURL=create-mock-exam.dto.js.map