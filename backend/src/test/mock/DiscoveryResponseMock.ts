import AssistantV1 from 'ibm-watson/assistant/v1';
import { IncomingHttpHeaders } from 'http';

export class DiscoveryResponseMock implements AssistantV1.Response<AssistantV1.MessageResponse> {
  result: any = {
    input: {},
    intents: [],
    entities: [],
    context: {},
    // eslint-disable-next-line @typescript-eslint/camelcase
    output: { text: null, log_messages: null, generic: [] },
  };
  status = 0;
  statusText = '';
  headers: IncomingHttpHeaders = null;

  public static okResponseWithResult(result: Record<string, any>): DiscoveryResponseMock {
    const retVal = new DiscoveryResponseMock();
    retVal.result = result as any;
    return retVal;
  }
}
