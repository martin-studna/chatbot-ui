export interface IConversationService {
  getObligatorySchemas(): Array<string>;
  getOptionalSchemas(): Array<string>;
  getServiceName(): string;
  getResponse(request: Record<string, any>): Promise<Record<string, any>>;
}
