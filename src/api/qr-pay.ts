import { AsnParser } from "@peculiar/asn1-schema";
import { PrivateKeyInfo } from "@peculiar/asn1-pkcs8";
import { ECPrivateKey } from "@peculiar/asn1-ecc";
import { p256 } from "@noble/curves/p256";
import { sha256 } from "@noble/hashes/sha256";
import { base64 } from "@scure/base";
import { bytesToHex } from "@noble/hashes/utils";
import type { Identification } from "~/models";
import { otp } from "./private/otp";
import { hashWithHMAC } from "~/core/hmac";

const QrCodeMode = {
  IZLY: "AIZ",
  SMONEY: "A"
} as const;

const signWithPrivateKey = (textToSign: string, pem: string): Uint8Array => {
  const cert = AsnParser.parse(base64.decode(pem), PrivateKeyInfo);
  const keys = AsnParser.parse(cert.privateKey.buffer, ECPrivateKey);
  const privateKey = new Uint8Array(keys.privateKey.buffer);

  const hash = sha256.create();
  hash.update(textToSign);

  const signature = p256.sign(hash.digest(), privateKey);
  return signature.toDERRawBytes();
};

/**
 * @returns data to show in a qrcode
 */
export const qrPay = (identification: Identification): string => {
  // Replicate `SimpleDateFormat("yyyy-MM-dd HH:mm:ss")`
  const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit", hour12: false, second: "2-digit", minute: "2-digit", hour: "2-digit" });
  const dateNowFormatted = dateFormatter.format(new Date()).replace(",", "");

  let hotpCode = otp(identification.seed, identification.refreshCount);
  identification.refreshCount++;

  const GUID = identification.userPublicID;
  const hmacKey = hotpCode.substring(0, hotpCode.length - 1);
  const privateKey = identification.qrCodePrivateKey;

  let content = QrCodeMode.IZLY + ";" + GUID + ";" + dateNowFormatted + ";3";
  content = content + ";" + bytesToHex(hashWithHMAC(`${content}+${identification.nsse}`, hmacKey)) + ";";

  const signed = signWithPrivateKey(content, privateKey);
  return base64.encode(signed);
};
