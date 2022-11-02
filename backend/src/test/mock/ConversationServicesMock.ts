import { ConversationService } from '../../class/ConversationService/ConversationService';
import { ConversationServiceMock } from './ConversationServiceMock';
import { IConversationServices } from '../../interface/IConversationServices';

export class ConversationServicesMock implements IConversationServices {
  public obligatorySchemas: Set<string>;
  public optionalSchemas: Set<string>;
  public schemaPathToSchema: Map<string, string>;
  public schemaStrings: Map<string, string>;
  public serviceMock: ConversationServiceMock;

  constructor() {
    this.obligatorySchemas = new Set();
    this.optionalSchemas = new Set();
    this.schemaPathToSchema = new Map();
    this.schemaStrings = new Map();
  }

  public getObligatorySchemas(): Set<string> {
    return this.obligatorySchemas;
  }

  public getOptionalSchemas(): Set<string> {
    return this.optionalSchemas;
  }

  public async getSchemasOnFS(): Promise<Set<string>> {
    return new Set(this.schemaPathToSchema.keys());
  }

  public async getSchemaAsStr(path: string): Promise<string> {
    return this.schemaPathToSchema.get(path);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getServiceByName(serviceName: string): ConversationService {
    return this.serviceMock;
  }

  public registerServiceMock(service: ConversationServiceMock): void {
    this.serviceMock = service;
  }

  public getServices(): Array<ConversationService> {
    return this.serviceMock ? [this.serviceMock] : [];
  }

  public async isSchemaOnFS(path: string): Promise<boolean> {
    return (
      this.serviceMock &&
      ((/request/.test(path) && this.serviceMock.hasRequestValidation()) ||
        (/response/.test(path) && this.serviceMock.hasResponseValidation()))
    );
  }
}
