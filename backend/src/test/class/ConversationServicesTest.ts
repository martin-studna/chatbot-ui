import { ConversationServices } from '../../class/ConversationServices';
import { ConversationServiceMock } from '../mock/ConversationServiceMock';
import { ConversationServiceMock2 } from '../mock/ConversationServiceMock2';
import { FSMock } from '../mock/FSMock';
import { Logger } from '../../class/Logger/Logger';

export class ConversationServicesTest {
  private schemaDir = __dirname.replace(/\/(src|dist)\/test\/class$/, '/src/jsonschema');
  private logger = new Logger();

  private async obligatorySchemasListTest(): Promise<void> {
    it('obligatory-schemas-list', async () => {
      expect.assertions(1);
      const services = new ConversationServices(
        [
          new ConversationServiceMock({
            logger: this.logger,
            requestValidation: true,
            responseValidation: false,
          }),
          new ConversationServiceMock2({
            logger: this.logger,
            requestValidation: true,
            responseValidation: true,
          }),
        ],
        null,
      );
      const expectedObligatorySchemas = new Set<string>();
      [
        `${this.schemaDir}/request/Mock.json`,
        `${this.schemaDir}/request/Mock2.json`,
        `${this.schemaDir}/response/Mock2.json`,
      ].forEach((schema: string) => {
        expectedObligatorySchemas.add(schema);
      });
      return expect(services.getObligatorySchemas()).toStrictEqual(expectedObligatorySchemas);
    });
  }

  private async optionalSchemasListTest(): Promise<void> {
    it('optional-schemas-list', async () => {
      expect.assertions(1);
      const services = new ConversationServices(
        [
          new ConversationServiceMock({
            logger: this.logger,
            requestValidation: false,
            responseValidation: true,
          }),
          new ConversationServiceMock2({
            logger: this.logger,
            requestValidation: false,
            responseValidation: false,
          }),
        ],
        null,
      );
      const expectedOptionalSchemas = new Set<string>();
      [
        `${this.schemaDir}/request/Mock.json`,
        `${this.schemaDir}/request/Mock2.json`,
        `${this.schemaDir}/response/Mock2.json`,
      ].forEach((schema: string) => {
        expectedOptionalSchemas.add(schema);
      });
      return expect(services.getOptionalSchemas()).toStrictEqual(expectedOptionalSchemas);
    });
  }

  private async getSchemasOnFSTest(): Promise<void> {
    it('get-schemas-on-fs', async () => {
      const fsMock = new FSMock();
      expect.assertions(1);
      fsMock.addReadDirResult(['f.json', 'f.ignored']);
      fsMock.addReadDirResult(['g.json', 'g.ignored']);
      const services = new ConversationServices([], fsMock);
      const expectedValue = new Set<string>();
      expectedValue.add(`${this.schemaDir}/request/f.json`);
      expectedValue.add(`${this.schemaDir}/response/g.json`);
      const testedValue: Set<string> = await services.getSchemasOnFS();
      await expect(testedValue).toStrictEqual(expectedValue);
    });
  }

  private async isSchemaOnFSTest(): Promise<void> {
    it('is-schema-on-fs', async () => {
      const fsMock = new FSMock();
      expect.assertions(4);
      fsMock.addReadDirResult(['f.json', 'f.ignored']);
      fsMock.addReadDirResult(['g.json', 'g.ignored']);
      const services = new ConversationServices([], fsMock);
      const reqDir = `${this.schemaDir}/request`;
      const resDir = `${this.schemaDir}/response`;
      expect(await services.isSchemaOnFS(`${reqDir}/f.json`)).toStrictEqual(true);
      expect(await services.isSchemaOnFS(`${reqDir}/f.ignored`)).toStrictEqual(false);
      expect(await services.isSchemaOnFS(`${resDir}/g.json`)).toStrictEqual(true);
      expect(await services.isSchemaOnFS(`${resDir}/g.ignored`)).toStrictEqual(false);
    });
  }

  async test(): Promise<void> {
    this.obligatorySchemasListTest();
    this.optionalSchemasListTest();
    this.getSchemasOnFSTest();
    this.isSchemaOnFSTest();
  }
}

new ConversationServicesTest().test();
