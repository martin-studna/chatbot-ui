import AssistantV1 from 'ibm-watson/assistant/v1';
import { IConversationAPI } from '../../interface/IConversationAPI';
import { MessageResponseMock } from './MessageResponseMock';

export class ConversationAPIMock implements IConversationAPI {
  private responses: Array<AssistantV1.Response<AssistantV1.MessageResponse>> = [];
  private requestValidators: Array<(msg: AssistantV1.MessageRequest) => void> = [];
  private requestCounter = 0;

  public addResponse(
    response: AssistantV1.Response<AssistantV1.MessageResponse>,
  ): ConversationAPIMock {
    this.responses.push(response);
    return this;
  }

  public addRequestValidator(
    validator: (msg: AssistantV1.MessageRequest) => void,
  ): ConversationAPIMock {
    this.requestValidators.push(validator);
    return this;
  }

  async message(
    request: AssistantV1.MessageRequest,
  ): Promise<AssistantV1.Response<AssistantV1.MessageResponse>> {
    if (this.requestCounter < this.requestValidators.length) {
      this.requestValidators[this.requestCounter](request);
    }
    const respDefined: boolean = this.requestCounter < this.responses.length;
    const retVal: AssistantV1.Response<AssistantV1.MessageResponse> = respDefined
      ? this.responses[this.requestCounter]
      : new MessageResponseMock();
    this.requestCounter++;
    return retVal;
  }
}
