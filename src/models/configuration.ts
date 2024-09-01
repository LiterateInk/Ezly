export type Configuration = Readonly<{
  currency: string

  paymentMinimum: number
  paymentMaximum: number
  paymentPartMinimum: number
  paymentPartMaximum: number

  moneyInMinimum: number
  moneyInMaximum: number
  moneyOutMinimum: number
  moneyOutMaximum: number
}>;
