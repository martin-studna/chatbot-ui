import AssistantV1 from 'ibm-watson/assistant/v1';

export interface IConversationAPI {
  message: (payload: AssistantV1.MessageRequest) => Promise<AssistantV1.Response>;
}
