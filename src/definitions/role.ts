import type { UserRole } from "./user-role";

export type Role = Readonly<{
  Id: number;
  Name: string;
  Value: UserRole;
}>;
