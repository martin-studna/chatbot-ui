import { IConversationServices } from './IConversationServices';
import { Logger } from '../class/Logger/Logger';

export interface IConversationServiceConfig {
  services?: IConversationServices;
  requestValidation?: boolean;
  responseValidation?: boolean;
  endpoint?: string;
  logger: Logger;
}
