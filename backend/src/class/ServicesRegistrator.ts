import { IServicesRegistrator } from '../interface/IServicesRegistrator';
import { AuthenticationPreProcessingService } from './PreProcessingService/AuthenticationPreProcessingService';
import { IConversationServices } from '../interface/IConversationServices';
import { ConversationServices } from './ConversationServices';
// example
// import { ConversationServiceHelloWorld } from './ConversationService/ConversationServiceHelloWorld';
import { IPreprocessingService } from '../interface/IPreprocessingService';
import { IPostprocessingService } from '../interface/IPostprocessingService';
import { Logger } from './Logger/Logger';

export class ServicesRegistrator implements IServicesRegistrator {
  constructor(private logger: Logger) {}

  private preProcessingServices = [new AuthenticationPreProcessingService(this.logger)];

  // example
  // private conversationServices = new ConversationServices([new ConversationServiceHelloWorld()]);
  private conversationServices = new ConversationServices([]);

  private postProcessingServices = [];

  public getPreprocessingServices(): Array<IPreprocessingService> {
    return this.preProcessingServices;
  }

  public getConversationServices(): IConversationServices {
    return this.conversationServices;
  }

  public getPostProcessingServices(): Array<IPostprocessingService> {
    return this.postProcessingServices;
  }
}
