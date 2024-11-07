import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";
import { otp } from "./private/otp";
import { NotRefreshableError, ReauthenticateError, type Identification } from "~/models";
import type { Error as ServerError } from "~/definitions/error";

import type { ClientUserStatus } from "~/definitions/client-user-status";
import type { Tokens } from "~/definitions/tokens";
export type { ClientUserStatus, Tokens };

export const refresh = async (identification: Identification, secret: string, fetcher: Fetcher = defaultFetcher): Promise<void> => {
  const passOTP = secret + otp(identification);

  const request: Request = {
    url: createRouteREST("LogonLight"),
    method: "POST",
    headers: {
      version: "2.0",
      channel: "AIZ",
      format: "T",
      model: "A",
      clientVersion: SERVICE_VERSION,
      smoneyClientType: CLIENT_TYPE,
      language: "fr",
      userId: identification.identifier,
      password: secret,
      passOTP,
      "Authorization": `Bearer ${identification.accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };

  const response = await fetcher(request);
  const json = JSON.parse(response.content) as {
    LogonLightResult: {
      Result: {
        HasNewActu: boolean
        NSSE: string | null
        SessionId: string
        Tokens: Tokens | null
        UserStatus: ClientUserStatus
      }
    }
  } | ServerError;

  if ("Code" in json) {
    if (json.Code === 571)
      // For some reason, people might receive an SMS
      // at this moment, but the URL in the SMS
      // is completely unusable...
      throw new NotRefreshableError();

    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  const result = json.LogonLightResult.Result;
  identification.sessionID = result.SessionId;

  if (result.NSSE) {
    identification.nsse = result.NSSE;
  }

  if (result.Tokens) {
    identification.accessToken = result.Tokens.AccessToken;
    identification.refreshToken = result.Tokens.RefreshToken;
    identification.accessTokenExpiresIn = result.Tokens.ExpiresIn;
  }
};
