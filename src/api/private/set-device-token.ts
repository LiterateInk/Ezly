import { Identification } from "~/models";
import { xml } from "~/core/xml";
import { CLIENT_TYPE, SERVICE_VERSION, SOAP_URL, SOAP_USER_AGENT } from "~/core/constants";
import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";

export const setDeviceToken = async (identification: Identification, fetcher: Fetcher = defaultFetcher): Promise<void> => {
  const body = xml.header + xml.envelope(`
    <SetDeviceToken xmlns="Service" id="o0" c:root="1">
    ${xml.property("version", SERVICE_VERSION)}
    ${xml.property("channel", "AIZ")}
    ${xml.property("format", "T")}
    ${xml.property("model", "A")}
    ${xml.property("language", "fr")}
    ${xml.property("sessionId", identification.sessionID)}
    ${xml.property("userId", identification.identifier)}
    ${xml.property("tokentype", "GCM")}
    ${xml.property("token", identification.token)}
    </SetDeviceToken>
  `);

  const request: Request = {
    url: SOAP_URL,
    headers: {
      "User-Agent": SOAP_USER_AGENT,
      "SOAPAction": "Service/SetDeviceToken",
      "Content-Type": "text/xml;charset=utf-8",
      "clientVersion": SERVICE_VERSION,
      "smoneyClientType": CLIENT_TYPE,
      "Authorization": `Bearer ${identification.accessToken}`
    },
    content: body,
    method: "POST"
  };

  await fetcher(request);
};
