import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, SERVICE_VERSION } from "~/core/constants";
import { decodeBalance } from "~/decoders/balance";
import type { Balance, Identification } from "~/models";

export const balance = async (identification: Identification, fetcher: Fetcher = defaultFetcher): Promise<Balance> => {
  const request: Request = {
    url: new URL("https://rest.izly.fr/Service/PublicService.svc/rest/IsSessionValid"),
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
  const json = JSON.parse(response.content);

  if ("ErrorMessage" in json) {
    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  return decodeBalance(json.IsSessionValidResult.UP);
};
