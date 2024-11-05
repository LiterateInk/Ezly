import { base64url, base64 } from "@scure/base";
import { packBigEndian } from "~/core/pack";
import { hashWithHMAC } from "~/core/hmac";
import { Identification } from "~/models";

export const otp = (identification: Identification): string => {
  const packedCounter = packBigEndian(identification.counter);
  const hotp = base64url.encode(hashWithHMAC(packedCounter, base64.decode(identification.seed)));

  // Increment the counter !
  // That's why the `identification` object
  // should be saved (by the user) after calling this function.
  identification.counter++;

  return hotp;
};
