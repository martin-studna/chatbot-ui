import { SchemaValidator } from '../../class/SchemaValidator';
import { ConversationServiceMock } from '../mock/ConversationServiceMock';
import { ConversationServicesMock } from '../mock/ConversationServicesMock';
import { SchemaValidationException } from '../../exception/SchemaValidationException';
import { Logger } from '../../class/Logger/Logger';

export class SchemaValidatorTest {
  private validator: SchemaValidator;
  private schemaDir = __dirname.replace(/\/(src|dist)\/test\/class$/, '/src/jsonschema');
  private logger = new Logger();

  /**
   * An exception is thrown if an obligatory schema is missing
   */
  private missingSchemasTest(): void {
    it('no-missing-schemas', async () => {
      expect.assertions(1);
      const services = new ConversationServicesMock();
      const validator = new SchemaValidator(services);
      services.obligatorySchemas = new Set('A');
      services.schemaPathToSchema = new Map();
      services.schemaPathToSchema.set('A', '{}');
      await validator.validate(); // must be OK
      services.schemaPathToSchema.delete('A');
      return expect(validator.validate()).rejects.toStrictEqual(
        new SchemaValidationException('Schema A not found!'),
      );
    });
  }

  /**
   * An exception is thrown if there is some schema on the filesystem that is
   * not used by any service
   */
  private extraSchemasTest(): void {
    it('no-extra-schemas', async () => {
      expect.assertions(1);
      const services = new ConversationServicesMock();
      const validator = new SchemaValidator(services);
      services.schemaPathToSchema = new Map();
      services.schemaPathToSchema.set('B', '{}');
      services.obligatorySchemas = new Set('B');
      await validator.validate(); // must be OK
      services.schemaPathToSchema.set('C', '{}');
      services.optionalSchemas = new Set('C');
      await validator.validate(); // must be OK
      services.schemaPathToSchema.set('A', '{}');
      const errorStr = 'Schema A not used by any conversation service!';
      const error = new SchemaValidationException(errorStr);
      return expect(validator.validate()).rejects.toStrictEqual(error);
    });
  }

  /**
   * An exception is thrown if some of the converation service related schema
   * files contains an invalid JSON
   */
  private invalidJsonTest(): void {
    it('invalid-json', async () => {
      expect.assertions(1);
      const services = new ConversationServicesMock();
      services.serviceMock = new ConversationServiceMock({
        logger: this.logger,
        services,
        requestValidation: true,
        responseValidation: false,
      });
      const validator = new SchemaValidator(services);
      services.schemaPathToSchema = new Map();
      const path = `${this.schemaDir}/request/Mock.json`;
      services.schemaPathToSchema.set(path, '{');
      services.obligatorySchemas = new Set([path]);
      try {
        await validator.validate();
      } catch (e) {
        debugger;
        const instanceTest = e instanceof SchemaValidationException;
        const text = `Error: Schema ${path}: Invalid JSON - `;
        const textTest = e.toString().startsWith(text);
        expect(instanceTest && textTest).toStrictEqual(true);
      }
    });
  }

  /**
   * An exception is thrown if some of the converation service related schema
   * files is not a valid JSON schema
   */
  private invalidSchemaTest(): void {
    it('invalid-schema', async () => {
      expect.assertions(1);
      const services = new ConversationServicesMock();
      services.serviceMock = new ConversationServiceMock({
        logger: this.logger,
        services,
        requestValidation: true,
        responseValidation: false,
      });
      const validator = new SchemaValidator(services);
      services.schemaPathToSchema = new Map();
      const path = `${this.schemaDir}/request/Mock.json`;
      services.schemaPathToSchema.set(
        path,
        JSON.stringify({
          type: 'object',
          properties: {
            date: {
              type: 'unexisting-type',
            },
          },
        }),
      );
      services.obligatorySchemas = new Set([path]);
      try {
        await validator.validate();
      } catch (e) {
        const instanceTest = e instanceof SchemaValidationException;
        const text = `Error: Schema ${path}: Invalid schema - `;
        const textTest = e.toString().startsWith(text);
        expect(instanceTest && textTest).toStrictEqual(true);
      }
    });
  }

  async test(): Promise<void> {
    this.missingSchemasTest();
    this.extraSchemasTest();
    this.invalidJsonTest();
    this.invalidSchemaTest();
  }
}

new SchemaValidatorTest().test();
