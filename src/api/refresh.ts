import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, SERVICE_VERSION } from "~/core/constants";
import { otp } from "./private/otp";
import { NotRefreshableError, type Identification } from "~/models";

export const refresh = async (identification: Identification, secret: string, fetcher: Fetcher = defaultFetcher): Promise<void> => {
  const passOTP = secret + otp(identification);

  const request: Request = {
    url: new URL("https://rest.izly.fr/Service/PublicService.svc/rest/LogonLight"),
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
  const json = JSON.parse(response.content);
  if ("Code" in response) {
    if (response.Code === 571) {
      // for some reason, people might receive an SMS
      // at this moment, but the URL in the SMS
      // is completely unusable...
      throw new NotRefreshableError();
    }
  }

  const result = json.LogonLightResult.Result;
  identification.sessionID = result.SessionId;

  if (result.Tokens) {
    // TODO: parse `Tokens` when not null
  }
};
