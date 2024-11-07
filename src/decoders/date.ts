export const decodeFormattedDate = (date: string) => new Date(parseInt(date.substring(6, date.length - 2).split("+")[0]));
