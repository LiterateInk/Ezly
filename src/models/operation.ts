export type Operation = Readonly<{
  id: number
  amount: number
  date: Date
  isCredit: boolean
  message: string | null
  type: 2 | 7
  status: number
}>;

// TODO: not sure what "type" means here, is it an enum ?

// on operation 0:
// "Message": "Carte bancaire",
// "OperationType": 7

// on operation 2:
//  "Message": null,
// "OperationType": 2,
