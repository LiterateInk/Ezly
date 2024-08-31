import type { Balance } from "~/models";

export const decodeBalance = (data: any): Balance => {
  // ex: 31-08-2024 04:57:45
  const [date, time] = data.LUD.split(" ") as string[];
  // date is reversed for proper parsing, we reverse it manually.
  const reversedDate = date.split("-").reverse().join("-");

  return {
    value: parseFloat(data.BAL),
    cashValue: parseFloat(data.CASHBAL),
    g7CardValue: parseFloat(data.G7CARDBAL ?? 0),
    lastUpdate: new Date(`${reversedDate} ${time}`)
  };
};
