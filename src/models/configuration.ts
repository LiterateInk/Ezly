export type Configuration = Readonly<{
  currency: string

  p2pPayMin: number
  p2pPayMax: number
  p2pPayPartMin: number
  p2pPayPartMax: number

  moneyInMin: number
  moneyInMax: number
  moneyOutMin: number
  moneyOutMax: number

  p2pRequestAmount: number
  p2pGetAmount: number

  transactionAmount: number
}>;
