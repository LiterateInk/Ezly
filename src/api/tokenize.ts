import { defaultFetcher, type Fetcher, findValueBetween, getHeaderFromResponse, Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, SERVICE_VERSION, SOAP_URL, SOAP_USER_AGENT } from "~/core/constants";

import { XMLParser } from "fast-xml-parser";
import { xml } from "~/core/xml";

import { decodeBalance } from "~/decoders/balance";
import type { Profile, Identification, Configuration } from "~/models";
// import { setDeviceToken } from "./private/set-device-token";

export const extractActivationURL = async (url: string, fetcher: Fetcher = defaultFetcher): Promise<string> => {
  let response = await fetcher({ url: new URL(url), redirect: "manual" });
  const location = getHeaderFromResponse(response, "Location");

  if (!location) {
    throw new Error("URL to tokenize expired");
  }

  return location;
};

export const tokenize = async (url: string, fetcher: Fetcher = defaultFetcher) => {
  // encoded like this:
  // izly://SBSCR/<identifier>/<code>
  const parts = url.split("/");
  const code = parts.pop()!;
  const identifier = parts.pop()!;

  const body = xml.header + xml.envelope(`
    <Logon xmlns="Service" id="o0" c:root="1">
    ${xml.property("version", SERVICE_VERSION)}
    ${xml.property("channel", "AIZ")}
    ${xml.property("format", "T")}
    ${xml.property("model", "A")}
    ${xml.property("language", "fr")}
    ${xml.property("user", identifier)}
    <password i:null="true" />
    ${xml.property("smoneyClientType", CLIENT_TYPE)}
    ${xml.property("rooted", "0")}
    ${xml.property("actCode", code)}
    </Logon>
  `);

  const request: Request = {
    url: SOAP_URL,
    headers: {
      "User-Agent": SOAP_USER_AGENT,
      "SOAPAction": "Service/Logon",
      "Content-Type": "text/xml;charset=utf-8",
      "clientVersion": SERVICE_VERSION,
      "smoneyClientType": CLIENT_TYPE
    },
    content: body,
    method: "POST"
  };

  const response = await fetcher(request);

  const result = findValueBetween(response.content, "<LogonResult>", "</LogonResult>");
  if (!result) throw new Error("No <LogonResult> found in response");

  const decoded = xml.from_entities(result);
  const parser = new XMLParser({
    numberParseOptions: {
      leadingZeros: true,
      hex: true,
      skipLike: /[0-9]/
    }
  });
  const { Logon } = parser.parse(decoded);

  const output = {
    configuration: {
      currency: Logon.CUR,
      paymentMinimum: parseFloat(Logon.P2PPAYMIN),
      paymentMaximum: parseFloat(Logon.P2PPAYMAX),
      paymentPartMinimum: parseFloat(Logon.P2PPAYPARTMIN),
      paymentPartMaximum: parseFloat(Logon.P2PPAYPARTMAX),

      moneyInMinimum: parseFloat(Logon.MONEYINMIN),
      moneyInMaximum: parseFloat(Logon.MONEYINMAX),
      moneyOutMinimum: parseFloat(Logon.MONEYOUTMIN),
      moneyOutMaximum: parseFloat(Logon.MONEYOUTMAX)
    } as Configuration,

    identification: {
      identifier: Logon.UID,

      userID: Logon.USER_ID,
      sessionID: Logon.SID,
      seed: Logon.SEED,
      nsse: Logon.NSSE,

      token: Logon.TOKEN,

      userPublicID: Logon.USER_PUBLIC_ID,
      qrCodePrivateKey: Logon.QR_CODE_PRIVATE_KEY,

      accessToken: Logon.OAUTH.ACCESS_TOKEN,
      accessTokenExpiresIn: parseInt(Logon.OAUTH.EXPIRES_IN),
      refreshToken: Logon.OAUTH.REFRESH_TOKEN,

      // reauth data
      refreshCount: 0
    } as Identification,

    balance: decodeBalance(Logon.UP),

    profile: {
      email: Logon.EMAIL,
      firstName: Logon.FNAME,
      lastName: Logon.LNAME,
      identifier: Logon.ALIAS
    } as Profile
  };

  // register the token for this session id
  // EDIT: apparently only for GCM (Google Cloud Messaging)
  // await setDeviceToken(output.identification, fetcher);

  return output;
};
