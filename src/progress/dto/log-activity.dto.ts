export class LogActivityDto {
  userId!: string;
  solvedCount?: number;
  correctCount?: number;
  skippedCount?: number;
  timeSpent?: number;
  activeMinutes?: number;
}
