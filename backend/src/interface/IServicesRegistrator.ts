import { IPreprocessingService } from './IPreprocessingService';
import { IConversationServices } from './IConversationServices';
import { IPostprocessingService } from './IPostprocessingService';

export interface IServicesRegistrator {
  getPreprocessingServices(): Array<IPreprocessingService>;
  getConversationServices(): IConversationServices;
  getPostProcessingServices(): Array<IPostprocessingService>;
}
