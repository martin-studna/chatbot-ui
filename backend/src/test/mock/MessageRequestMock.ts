import AssistantV1 from 'ibm-watson/assistant/v1';

export class MessageRequestMock implements AssistantV1.MessageRequest {
  input: AssistantV1.MessageInput = null;
  result: AssistantV1.MessageResponse = null;
  context: AssistantV1.Context = {};
}
