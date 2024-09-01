import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, SERVICE_VERSION } from "~/core/constants";
import { decodeBalance } from "~/decoders/balance";
import { ReauthenticateError, type Configuration, type Identification, type Profile } from "~/models";

/**
 * this request might ask you to re-authenticate (using only your passcode)
 */
export const information = async (identification: Identification, fetcher: Fetcher = defaultFetcher) => {
  const url = new URL("https://rest.izly.fr/Service/PublicService.svc/rest/GetLogonInfos");
  const request: Request = {
    url,
    headers: {
      version: "2.0",
      channel: "AIZ",
      format: "T",
      model: "A",
      clientVersion: SERVICE_VERSION,
      smoneyClientType: CLIENT_TYPE,
      language: "fr",
      userId: identification.identifier,
      "Authorization": `Bearer ${identification.accessToken}`
    }
  };

  const response = await fetcher(request);
  const json = JSON.parse(response.content);

  if ("ErrorMessage" in json) {
    if (json.Code === 570) {
      throw new ReauthenticateError();
    }

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  const data = json.GetLogonInfosResult.Result;

  return {
    configuration: {
      currency: data.Currency,
      moneyInMinimum: data.LimitMoneyIn.Min,
      moneyInMaximum: data.LimitMoneyIn.Max,
      moneyOutMinimum: data.LimitMoneyOut.Min,
      moneyOutMaximum: data.LimitMoneyOut.Max,
      paymentMinimum: data.LimitPayment.Min,
      paymentMaximum: data.LimitPayment.Max,
      paymentPartMinimum: data.LimitPaymentPart.Min,
      paymentPartMaximum: data.LimitPaymentPart.Max
    } as Configuration,
    profile: {
      email: data.Email,
      firstName: data.FirstName,
      lastName: data.LastName,
      identifier: data.UserIdentifier
    } as Profile,
    balance: decodeBalance(json.GetLogonInfosResult.UP)
  };
};
