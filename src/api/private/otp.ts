import forge from "node-forge";
import { packBigEndian } from "~/core/pack";

export const otp = (seed: string, counter: number): string => {
  const key = forge.util.decode64(seed);
  const packedCounter = packBigEndian(counter);

  const hmac = forge.hmac.create();
  hmac.start("sha1", key);
  hmac.update(packedCounter);

  let output = forge.util.encode64(hmac.digest().getBytes());
  output = output
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return output;
};
