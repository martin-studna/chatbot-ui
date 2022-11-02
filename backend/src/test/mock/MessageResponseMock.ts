import AssistantV1 from 'ibm-watson/assistant/v1';
import { IncomingHttpHeaders } from 'http';

export class MessageResponseMock implements AssistantV1.Response<AssistantV1.MessageResponse> {
  result: AssistantV1.MessageResponse = {
    input: null,
    intents: [],
    entities: [],
    context: {},
    output: null,
  };
  status = 0;
  statusText = '';
  headers: IncomingHttpHeaders = null;

  public static okResponseWithResult(result: Record<string, any>): MessageResponseMock {
    const retVal = new MessageResponseMock();
    retVal.result = result as AssistantV1.MessageResponse;
    return retVal;
  }
}
