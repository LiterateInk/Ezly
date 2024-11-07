import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, SERVICE_VERSION } from "~/core/constants";
import { decodeFormattedDate } from "~/decoders/date";
import type { Identification, Operation } from "~/models";

export const OperationKind = {
  TopUp: 0,
  Transfer: 1,
  Payment: 2
} as const;

export type OperationKind = typeof OperationKind[keyof typeof OperationKind];

/**
 * @returns a list of the last operations
 */
export const operations = async (identification: Identification, kind: OperationKind, limit = 15, fetcher: Fetcher = defaultFetcher): Promise<Array<Operation>> => {
  // transactionGroup=2 means history of operations
  const url = new URL(`https://rest.izly.fr/Service/PublicService.svc/rest/GetHomePageOperations?transactionGroup=${kind}&top=${limit}`);
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
      sessionId: identification.sessionID,
      "Authorization": `Bearer ${identification.accessToken}`
    }
  };

  const response = await fetcher(request);
  const json = JSON.parse(response.content);

  return json.GetHomePageOperationsResult.Result.map((operation: any) => ({
    id: operation.Id,
    amount: operation.Amount,
    date: decodeFormattedDate(operation.Date),
    isCredit: operation.IsCredit,
    message: operation.Message as string | null,
    type: operation.OperationType,
    status: operation.Status
  } as Operation));
};


