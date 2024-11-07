import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";
import { ReauthenticateError, type Identification } from "~/models";

import type { Error as ServerError } from "~/definitions/error";
import type { Limit } from "~/definitions/limit";
export type { Limit };

export const limits = async (identification: Identification, fetcher: Fetcher = defaultFetcher) => {
  const request: Request = {
    url: createRouteREST("GetCurrentLimits"),
    headers: {
      version: "2.0",
      channel: "AIZ",
      format: "T",
      model: "A",
      clientVersion: SERVICE_VERSION,
      smoneyClientType: CLIENT_TYPE,
      language: "fr",
      userId: identification.identifier,
      sessionId: identification.sessionID,
      "Authorization": `Bearer ${identification.accessToken}`
    }
  };

  const response = await fetcher(request);
  const json = JSON.parse(response.content) as {
    CurrentLimits: Array<Limit>
    CurrentRole: number
    ExtendedLimits: Array<Limit>
    ExtendedRole: number
    KycStatus: number
  } | ServerError;

  if ("ErrorMessage" in json) {
    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  return json;
};
