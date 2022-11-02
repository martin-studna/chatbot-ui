import { ConversationServiceMock } from '../mock/ConversationServiceMock';
import { Logger } from '../../class/Logger/Logger';

export class ConversationServiceTest {
  private schemaDir = __dirname.replace(/\/(src|dist)\/test\/class$/, '/src/jsonschema');
  private logger = new Logger();

  /**
   * Tests that obligatory schemas are in line with the properties
   * requestValidation and responseValidation
   */
  private async obligatorySchemasListTest(): Promise<void> {
    it('obligatory-schemas-list', async () => {
      expect.assertions(3);
      const req = `${this.schemaDir}/request/Mock.json`;
      const res = `${this.schemaDir}/response/Mock.json`;
      let service: ConversationServiceMock;
      service = new ConversationServiceMock({
        logger: this.logger,
        requestValidation: true,
        responseValidation: false,
      });
      expect(service.getObligatorySchemas()).toStrictEqual([req]);
      service = new ConversationServiceMock({
        logger: this.logger,
        requestValidation: false,
        responseValidation: true,
      });
      expect(service.getObligatorySchemas()).toStrictEqual([res]);
      service = new ConversationServiceMock({ logger: this.logger });
      expect(service.getObligatorySchemas()).toStrictEqual([req, res]);
    });
  }

  /**
   * Tests that optional schemas are in line with the properties
   * requestValidation and responseValidation
   */
  private async optionalSchemasListTest(): Promise<void> {
    it('optional-schemas-list', async () => {
      expect.assertions(3);
      const req = `${this.schemaDir}/request/Mock.json`;
      const res = `${this.schemaDir}/response/Mock.json`;
      let service: ConversationServiceMock;
      service = new ConversationServiceMock({
        logger: this.logger,
        requestValidation: true,
        responseValidation: false,
      });
      expect(service.getOptionalSchemas()).toStrictEqual([res]);
      service = new ConversationServiceMock({
        logger: this.logger,
        requestValidation: false,
        responseValidation: true,
      });
      expect(service.getOptionalSchemas()).toStrictEqual([req]);
      service = new ConversationServiceMock({
        logger: this.logger,
        requestValidation: false,
        responseValidation: false,
      });
      expect(service.getOptionalSchemas()).toStrictEqual([req, res]);
    });
  }

  async test(): Promise<void> {
    this.obligatorySchemasListTest();
    this.optionalSchemasListTest();
  }
}

new ConversationServiceTest().test();
