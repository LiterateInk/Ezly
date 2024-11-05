import { base64urlnopad } from "@scure/base";
import { packBigEndian } from "~/core/pack";
import { hashWithHMAC } from "~/core/hmac";

export const otp = (seed: string, counter: number): string => {
  const packedCounter = packBigEndian(counter);
  return base64urlnopad.encode(hashWithHMAC(packedCounter, base64urlnopad.decode(seed)));
};
