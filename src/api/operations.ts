import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";
import { decodeFormattedDate } from "~/decoders/date";
import type { HomePageOperation } from "~/definitions/home-page-operation";
import { ReauthenticateError, type Identification, type Operation } from "~/models";
import type { Error as ServerError } from "~/definitions/error";

import { TransactionGroup } from "~/definitions/transaction-group";
export { TransactionGroup };

/**
 * @returns a list of the last operations
 */
export const operations = async (identification: Identification, group: TransactionGroup, limit = 15, fetcher: Fetcher = defaultFetcher): Promise<Array<Operation>> => {
  const request: Request = {
    url: createRouteREST(`GetHomePageOperations?transactionGroup=${group}&top=${limit}`),
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
    GetHomePageOperationsResult: {
      Result: Array<HomePageOperation>
    }
  } | ServerError;

  if ("ErrorMessage" in json) {
    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  return json.GetHomePageOperationsResult.Result.map((operation) => ({
    id: operation.Id,
    amount: operation.Amount,
    date: decodeFormattedDate(operation.Date),
    isCredit: operation.IsCredit,
    message: operation.Message,
    type: operation.OperationType,
    status: operation.Status
  } satisfies Operation));
};
