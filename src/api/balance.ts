import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";
import { decodeBalance } from "~/decoders/balance";
import { ReauthenticateError, type Balance, type Identification } from "~/models";
import type { Error as ServerError } from "~/definitions/error";
import { UP } from "~/definitions/up";

export const balance = async (identification: Identification, fetcher: Fetcher = defaultFetcher): Promise<Balance> => {
  const request: Request = {
    url: createRouteREST("IsSessionValid"),
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
      sessionId: identification.sessionID
    })
  };

  const response = await fetcher(request);
  const json = JSON.parse(response.content) as {
    IsSessionValidResult: {
      UP: UP
    }
  } | ServerError;

  if ("ErrorMessage" in json) {
    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  return decodeBalance(json.IsSessionValidResult.UP);
};
