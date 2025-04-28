import { type Assignment, type User, type Movie } from "@prisma/client";

export type AssignmentType = "HOMEWORK" | "EXTRA_CREDIT" | "BONUS";

export interface AssignmentWithRelations extends Assignment {
  User: User;
  Movie: Movie | null;
  type: AssignmentType;
} 