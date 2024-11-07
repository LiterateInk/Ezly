import type { Role } from "./role";
import type { LimitType } from "./limit-type";
import type { DurationType } from "./duration-type";
import type { OperationType } from "./operation-type";
import type { OperationTypeGroup } from "./operation-type-group";

export type Limit = Readonly<{
  Description: string
  DurationType: DurationType
  Max: number
  Min: number
  OperationType: OperationType
  OperationTypeGroup: OperationTypeGroup | null
  Role: Role
  Type: LimitType
}>;
