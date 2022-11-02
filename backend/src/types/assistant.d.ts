import AssistantV1 from 'ibm-watson/assistant/v1';

/**
 * Definition of types for Watson Assistant
 */

export type CallAssistant = (payload: AssistantV1.MessageRequest) => Promise<any>;
export type HandleMessage = (
  payload: AssistantV1.MessageRequest,
  callAssistant: CallAssistant,
) => Promise<any>;
