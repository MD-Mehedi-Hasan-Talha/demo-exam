export class MarkWeakQuestionDto {
  userId!: string;
  questionId!: string;
  weak: boolean = true;
  nextRevisionDays?: number;
}
