import { AsnParser } from "@peculiar/asn1-schema";
import { ECPrivateKey } from "@peculiar/asn1-ecc";
import { PrivateKeyInfo } from "@peculiar/asn1-pkcs8";

import { hashWithHMAC } from "~/core/hmac";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";

import { base64 } from "@scure/base";
import { p256 } from "@noble/curves/p256";

import { otp } from "~/api/private/otp";
import type { Identification } from "~/models";

// NOTE: We're only using `IZLY` for now but
// in the app there's also `SMONEY` as a mode.
const QrCodeMode = {
  IZLY: "AIZ",
  SMONEY: "A"
} as const;

/**
 * Generates the signature for the last
 * part of the QR code payload.
 */
const sign = (content: string, keyInfo: string): Uint8Array => {
  const info = AsnParser.parse(base64.decode(keyInfo), PrivateKeyInfo);
  const keys = AsnParser.parse(info.privateKey.buffer, ECPrivateKey);
  const privateKey = new Uint8Array(keys.privateKey.buffer);

  const hash = sha256.create().update(content).digest();
  const signed = p256.sign(hash, privateKey).toDERRawBytes();

  // Here's how we can debug this function...
  // Prerequisites: have the same inputs as the app when generating the QR code,
  //                so make sure to have the same `identification` object
  //                and `date` string as the payload.
  //
  // 1. Retrieve the public key from the private key
  // -  Luckily, Izly provides the public key in the ECPrivateKey structure.
  // const publicKey = p256.getPublicKey(privateKey);
  //
  // 2. Grab the last part of the QR code payload
  // -  so the part we're generating in this function...
  // const signedFromKotlin = base64.decode("MEUCIG1jEvjmNjx8PWK7u5BwaMverup7vvzSVkI6TYoyRh22AiEA4lmlaaOhu18E3oMo6uMmVQoFzShMZU0Sy8EhaOPbgQQ=");
  //
  // 3. Compare the app's generated signature with the hash we generated !
  // const verified = p256.verify(signedFromKotlin, hash, publicKey);
  // console.log("verified:", verified);
  //
  // When `verified` is true, the signature is valid.
  // Othrwise, the signature is invalid and there's work to do...

  return signed;
};

/**
 * Generates the payload that are contained
 * in the QR codes for the payment in the app.
 */
export const qrPay = (identification: Identification): string => {
  // Replicate `SimpleDateFormat("yyyy-MM-dd HH:mm:ss")`
  const dateFormatter = new Intl.DateTimeFormat("fr-CA", { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit", hour12: false, second: "2-digit", minute: "2-digit", hour: "2-digit" });
  const date = dateFormatter.format(new Date()).replace(",", "");
  const hotpCode = otp(identification);

  const content = `${QrCodeMode.IZLY};${identification.userPublicID};${date};3`;
  const hmac = bytesToHex(hashWithHMAC(`${content}+${identification.nsse}`, hotpCode));
  const payload = `${content};${hmac};`;

  // Concatenate payload with signature.
  return payload + base64.encode(sign(payload, identification.qrCodePrivateKey));
};
