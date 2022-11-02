import AssistantV1 from 'ibm-watson/assistant/v1';

export interface IPreprocessingService {
  processRequest(request: AssistantV1.MessageRequest): Promise<void>;
}
