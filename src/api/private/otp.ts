import { base64url, base64 } from "@scure/base";
import { packBigEndian } from "~/core/pack";
import { hashWithHMAC } from "~/core/hmac";

export const otp = (seed: string, counter: number): string => {
  const packedCounter = packBigEndian(counter);
  return base64url.encode(hashWithHMAC(packedCounter, base64.decode(seed)));
};
