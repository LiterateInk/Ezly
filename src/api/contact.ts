import { defaultFetcher, Fetcher, Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, SERVICE_VERSION } from "~/core/constants";
import { Identification } from "~/models";

export const contact = async (identification: Identification, fetcher: Fetcher = defaultFetcher) => {
  const request: Request = {
    url: new URL("https://rest.izly.fr/Service/PublicService.svc/rest/GetContactDetails"),
    method: "POST",
    headers: {
      version: "1.0",
      channel: "AIZ",
      format: "T",
      model: "A",
      clientVersion: SERVICE_VERSION,
      smoneyClientType: CLIENT_TYPE,
      language: "fr",
      userId: identification.identifier,
      sessionId: identification.sessionID,
      "Content-Type": "application/json",
      "Authorization": `Bearer ${identification.accessToken}`
    },
    content: JSON.stringify({
      receiver: {
        Identifier: identification.identifier
      }
    })
  };

  const response = await fetcher(request);
  const json = JSON.parse(response.content);

  // TODO: decode
  return json;
};
