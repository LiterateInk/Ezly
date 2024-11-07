import * as izly from "../src";
import { read } from "./_persisted-session";

void async function main () {
  const identification = await read();

  const payments = await izly.operations(identification, izly.OperationKind.Payment, 5);
  const topup = await izly.operations(identification, izly.OperationKind.TopUp, 5);

  console.info("- Payments -");
  for (const payment of payments) {
    const priceAsString = `${payment.amount.toPrecision(3)} EUR`;
    console.info(payment.date.toLocaleString("fr-FR"), "paid", priceAsString);
  }

  console.info("- Top-up -");
  for (const operation of topup) {
    const priceAsString = `${operation.amount.toPrecision(3)} EUR`;
    console.info(operation.date.toLocaleString("fr-FR"), "received", priceAsString);
  }
}();
