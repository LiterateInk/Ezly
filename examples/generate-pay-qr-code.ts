import * as izly from "../src";
import { persist, read } from "./_persisted-session";
import { toString as qrcode } from "qrcode";

void async function main () {
  const identification = await read();
  const data = izly.qrPay(identification);

  // show the qr code in the terminal
  qrcode(data, { type: "utf8" }, (_, qr) => {
    console.log(qr);
  });

  await persist(identification);
}();
