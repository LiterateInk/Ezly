import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";

import { ReauthenticateError, type Configuration, type Identification, type Profile } from "~/models";
import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";
import { decodeBalance } from "~/decoders/balance";

import type { ClientUserStatus } from "~/definitions/client-user-status";
import type { ClientUserRole } from "~/definitions/client-user-role";
import type { LimitMoneyIn } from "~/definitions/limit-money-in";
import type { Error as ServerError } from "~/definitions/error";
import type { BankCode } from "~/definitions/bank-code";
import type { UP } from "~/definitions/up";

export const information = async (identification: Identification, fetcher: Fetcher = defaultFetcher) => {
  const request: Request = {
    url: createRouteREST("GetLogonInfos"),
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
  const json = JSON.parse(response.content) as {
    GetLogonInfosResult: {
      UP: UP

      Result: {
        Age: number;
        Alias: string;
        Banks: Array<BankCode>;
        CategoryUserId: number;
        Crous: string;
        CrousName: string;
        Currency: string;
        Email: string;
        FirstName: string;
        HasNewActu: boolean;
        LastName: string;
        LimitMoneyIn: LimitMoneyIn;
        LimitMoneyOut: LimitMoneyIn;
        LimitPayment: LimitMoneyIn;
        LimitPaymentPart: LimitMoneyIn;
        OptIn: boolean;
        OptInPartners: boolean;
        Role: ClientUserRole;
        Services: string[]; // NOTE: "Izly" is the only value I've seen
        ServicesInfos: unknown | null; // TODO
        SubscriptionDate: string;
        TarifUserId: number;
        TermsConditionsAgreementDate: string;
        Token: string;
        UserId: number;
        UserIdentifier: string;
        UserStatus: ClientUserStatus;
        ZipCode: string;
      }
    }
  } | ServerError;

  if ("ErrorMessage" in json) {
    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

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
