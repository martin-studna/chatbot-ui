import AssistantV1, { Response } from 'ibm-watson/assistant/v1';

export interface IPostprocessingService {
  processResponse(response: Response<AssistantV1.MessageResponse>): Promise<void>;
}
