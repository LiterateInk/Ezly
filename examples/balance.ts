import * as izly from "../src";
import { read } from "./_persisted-session";

void async function main () {
  const { configuration, identification } = await read();

  const balance = await izly.balance(identification);
  console.log("Your balance is currently at", balance.value, configuration.currency);
  console.log("Your cash balance is currently at", balance.cashValue, configuration.currency);
  console.log(`Last updated the ${balance.lastUpdate.toLocaleString("fr-FR")}`);
}();
