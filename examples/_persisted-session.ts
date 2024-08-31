import type { Configuration, Identification } from "../src";

import fs from "node:fs/promises";
import path from "node:path";

const json = path.join(__dirname, "_persisted-session.json");

export const persist = async (identification: Identification, configuration: Configuration): Promise<void> => {
  await fs.writeFile(json, JSON.stringify({ configuration, identification }), "utf8");
};

export const read = async (): Promise<{
  identification: Identification
  configuration: Configuration
}> => {
  const data = await fs.readFile(json, "utf8");
  const parsed = JSON.parse(data);

  if (!parsed.identification || !parsed.configuration)
    throw new Error("You must authentication using 'mobile.ts' before !");

  return parsed;
};
