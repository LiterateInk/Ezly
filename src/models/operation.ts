import { OperationType } from "~/definitions/operation-type";
import { TransactionGroupStatus } from "~/definitions/transaction-group-status";
export { OperationType, TransactionGroupStatus };

export type Operation = Readonly<{
  amount: number
  date: Date
  id: number
  isCredit: boolean
  message: string | null
  type: OperationType
  status: TransactionGroupStatus
}>;
