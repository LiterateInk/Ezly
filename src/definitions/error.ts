import type { ErrorPriority } from "./error-priority";

export type Error = Readonly<{
  Code: number;
  ErrorMessage: string;
  Priority: ErrorPriority;
  Title: string;
}>;
