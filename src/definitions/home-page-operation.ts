import type { OperationType } from "./operation-type";
import type { TransactionGroupStatus } from "./transaction-group-status";

export type HomePageOperation = Readonly<{
  Amount: number;
  Date: string;
  Id: number;
  IsCredit: boolean;
  Message: string | null;
  OperationType: OperationType;
  Status: TransactionGroupStatus;
}>;
