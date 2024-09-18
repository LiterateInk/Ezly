import { sha1 } from "@noble/hashes/sha1";
import { hmac } from "@noble/hashes/hmac";

export const hashWithHMAC = (content: string, key: string | Uint8Array): Uint8Array => {
  return hmac.create(sha1, key)
    .update(content)
    .digest();
};
