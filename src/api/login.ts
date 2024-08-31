import { defaultFetcher, type Request, type Fetcher, findValueBetween } from "@literate.ink/utilities";
import { CLIENT_TYPE, SERVICE_VERSION, SOAP_URL, SOAP_USER_AGENT } from "~/core/constants";

import { xml } from "~/core/xml";
import { XMLParser } from "fast-xml-parser";

export const login = async (identifier: string, secret: string, fetcher: Fetcher = defaultFetcher) => {
  const body = xml.header + xml.envelope(`
    <Logon xmlns="Service" id="o0" c:root="1">
    ${xml.property("version", SERVICE_VERSION)}
    ${xml.property("channel", "AIZ")}
    ${xml.property("format", "T")}
    ${xml.property("model", "A")}
    ${xml.property("language", "fr")}
    ${xml.property("user", identifier)}
    ${xml.property("password", secret)}
    ${xml.property("smoneyClientType", CLIENT_TYPE)}
    ${xml.property("rooted", "0")}
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
  if (response.status !== 200) { // can be 500 apparently
    throw new Error(`${response.status}: ${response.content}`);
  }

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
  const parsed = parser.parse(decoded);

  if ("E" in parsed && "Error" in parsed.E) {
    throw new Error(`${parsed.E.Msg} (${parsed.E.Code})`);
  }

  return {
    uid: parsed.UserData.UID as number,
    salt: parsed.UserData.SALT as string
  };
};
