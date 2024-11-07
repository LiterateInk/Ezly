import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";
import { ReauthenticateError, type Identification } from "~/models";

import type { Error as ServerError } from "~/definitions/error";
import type { IzlyCrous } from "~/definitions/izly-crous";
export type { IzlyCrous };

export const crousContacts = async (identification: Identification, fetcher: Fetcher = defaultFetcher) => {
  const request: Request = {
    url: createRouteREST("GetCrousContactList"),
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
    GetCrousContactListResult: {
      Result: {
        CrousList: Array<IzlyCrous>
        UserContact: {
          Email: string
          Name: string
          Phone: string
        }
      }
    }
  } | ServerError;

  if ("ErrorMessage" in json) {
    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  return json.GetCrousContactListResult;
};
