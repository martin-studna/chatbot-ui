import { ConversationService } from '../class/ConversationService/ConversationService';

export interface IConversationServices {
  getObligatorySchemas(): Set<string>;
  getOptionalSchemas(): Set<string>;
  getSchemasOnFS(): Promise<Set<string>>;
  getSchemaAsStr(path: string): Promise<string>;
  getServiceByName(serviceName: string): ConversationService;
  getServices(): Array<ConversationService>;
  isSchemaOnFS(path: string): Promise<boolean>;
}
