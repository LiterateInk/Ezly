import { defaultFetcher, Fetcher, Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";
import { Identification, ReauthenticateError } from "~/models";

export const contact = async (identification: Identification, fetcher: Fetcher = defaultFetcher) => {
  const request: Request = {
    url: createRouteREST("GetContactDetails"),
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

  if ("ErrorMessage" in json) {
    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  // TODO: decode
  return json;
};
