import { ConversationService } from './ConversationService/ConversationService';
import { IConversationServices } from '../interface/IConversationServices';
import { SchemaValidationException } from '../exception/SchemaValidationException';

export class SchemaValidator {
  private services: IConversationServices;
  private errors: Array<string>;
  private obligatorySchemas: Set<string>;
  private optionalSchemas: Set<string>;
  private schemasOnFS: Set<string>;

  constructor(services: IConversationServices) {
    this.services = services;
  }

  private async loadSchemas(): Promise<void> {
    this.obligatorySchemas = this.services.getObligatorySchemas();
    this.optionalSchemas = this.services.getOptionalSchemas();
    this.schemasOnFS = await this.services.getSchemasOnFS();
  }

  private checkForMissingSchemas(): void {
    for (const schema of this.obligatorySchemas) {
      if (!this.schemasOnFS.has(schema)) {
        this.errors.push(`Schema ${schema} not found!`);
      }
    }
  }

  private checkForExtraSchemas(): void {
    for (const schema of this.schemasOnFS) {
      if (!this.obligatorySchemas.has(schema) && !this.optionalSchemas.has(schema)) {
        const str = `Schema ${schema} not used by any conversation service!`;
        this.errors.push(str);
      }
    }
  }

  private async validateSchemas(): Promise<void> {
    await Promise.all(
      this.services.getServices().map(
        async (service: ConversationService): Promise<void> => {
          try {
            await service.loadSchemas();
          } catch (e) {
            this.errors.push(e.toString().replace(/^Error: /, ''));
          }
        },
      ),
    );
  }

  /**
   * @pre: this.services is populated (done in constructor)
   * @post:
   *   1) All required JSON schemas are found
   *   2) There are no unused JSON schemas on the filesystem
   *   3) All JSON schemas are valid
   */
  public async validate(): Promise<void> {
    this.errors = [];
    await this.loadSchemas();
    this.checkForMissingSchemas();
    this.checkForExtraSchemas();
    await this.validateSchemas();
    if (this.errors.length > 0) {
      throw new SchemaValidationException(this.errors.join('\n'));
    }
  }
}
