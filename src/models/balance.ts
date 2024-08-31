export type Balance = Readonly<{
  value: number
  cashValue: number
  g7CardValue: number

  lastUpdate: Date
}>;
