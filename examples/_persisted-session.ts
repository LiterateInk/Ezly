import type { Identification } from "../src";

import fs from "node:fs/promises";
import path from "node:path";

const json = path.join(__dirname, "_persisted-session.json");

export const persist = async (identification: Identification): Promise<void> => {
  await fs.writeFile(json, JSON.stringify(identification), "utf8");
};

export const read = async (): Promise<Identification> => {
  const data = await fs.readFile(json, "utf8");
  return JSON.parse(data);
};
