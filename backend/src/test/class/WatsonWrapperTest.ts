import AssistantV1 from 'ibm-watson/assistant/v1';
import { ConversationServiceMock } from '../mock/ConversationServiceMock';
import { ConversationServicesMock } from '../mock/ConversationServicesMock';
import { ConversationAPIMock } from '../mock/ConversationAPIMock';
import { MessageResponseMock } from '../mock/MessageResponseMock';
import { MessageRequestMock } from '../mock/MessageRequestMock';
import { WatsonWrapper } from '../../class/WatsonWrapper';
import { ConversationServiceValidationException } from '../../exception/ConversationServiceValidationException';
import { ConversationServiceRuntimeException } from '../../exception/ConversationServiceRuntimeException';
import { SchemaValidationException } from '../../exception/SchemaValidationException';
import { Logger } from '../../class/Logger/Logger';

export class WatsonWrapperTest {
  private count = (process.env.test || 3) as number;
  private schemaDir = __dirname.replace(/\/(src|dist)\/test\/class$/, '/src/jsonschema');
  private logger = new Logger();

  private getWatsonSimpleRequest(extraParams: Record<string, any> = {}): Record<string, any> {
    return {
      output: {
        generic: [
          {
            // eslint-disable-next-line @typescript-eslint/camelcase
            response_type: 'text',
            text: 'Ignored',
          },
        ],
      },
      context: {
        'request-service': 'SERVICE_NAME',
        'request-params-PARAM1': 'VALUE1',
        ...extraParams,
      },
    };
  }

  private getWatsonSimpleRequestCleanedCtx(
    extraParams: Record<string, any> = {},
  ): Record<string, any> {
    const retVal = {
      'request-service': null,
      'request-params-PARAM1': null,
    };
    Object.keys(extraParams).forEach((key: string) => {
      retVal[key] = null;
    });
    return retVal;
  }

  private getSimpleJsonSchema(type: string): Record<string, any> {
    return {
      type: 'object',
      properties: {
        PARAM1: { type },
      },
    };
  }

  private getWatsonComplexRequest(): Record<string, any> {
    return this.getWatsonSimpleRequest({
      'request-params-PARAM2-PARAM3': 'VALUE3',
    });
  }

  /**
   * An exception must be thrown if the watson context variable $request-service specifies
   * an unknown service
   */
  private conversationServiceUnknownServiceTest(): void {
    it('conversation-service-unknown-service', async () => {
      const services = new ConversationServicesMock();
      const adapter = new ConversationAPIMock().addResponse(
        MessageResponseMock.okResponseWithResult(this.getWatsonSimpleRequest()),
      );
      const request = new MessageRequestMock();
      const watson = new WatsonWrapper(this.logger, adapter, services, [], [], request);
      return expect(watson.getResponse()).rejects.toStrictEqual(
        new ConversationServiceValidationException(
          "Conversation service 'SERVICE_NAME' received in $request-service not registered",
        ),
      );
    });
  }

  /**
   * Verifies that the watson context variables $request-params-* are correctly transformed to
   * the conversation service request
   */
  private conversationServiceRequestComputationTest(): void {
    it('conversation-service-request-computation', async () => {
      expect.assertions(1);
      const services = new ConversationServicesMock();
      const service: ConversationServiceMock = new ConversationServiceMock({
        logger: this.logger,
        services,
        requestValidation: false,
        responseValidation: false,
      });
      service.requestValidator = (request: Record<string, any>): void => {
        return expect(request).toStrictEqual({
          PARAM1: 'VALUE1',
          PARAM2: { PARAM3: 'VALUE3' },
        });
      };
      services.serviceMock = service;
      await service.loadSchemas();
      const adapter = new ConversationAPIMock().addResponse(
        MessageResponseMock.okResponseWithResult(this.getWatsonComplexRequest()),
      );
      const request = new MessageRequestMock();
      const watson = new WatsonWrapper(this.logger, adapter, services, [], [], request);
      await watson.getResponse();
    });
  }

  /**
   * Tests that en error is throws if the conversation service requires a request validation
   * and the request is not in line with the corresponding JSON schema
   */
  private conversationServiceInvalidRequestTest(): void {
    it('conversation-service-invalid-request', async () => {
      expect.assertions(1);
      const services = new ConversationServicesMock();
      const service: ConversationServiceMock = new ConversationServiceMock({
        logger: this.logger,
        services,
        requestValidation: true,
        responseValidation: false,
      });
      services.serviceMock = service;
      services.schemaPathToSchema.set(
        `${this.schemaDir}/request/Mock.json`,
        JSON.stringify(this.getSimpleJsonSchema('number')),
      );
      await service.loadSchemas();
      const adapter = new ConversationAPIMock()
        .addResponse(MessageResponseMock.okResponseWithResult(this.getWatsonSimpleRequest()))
        .addRequestValidator((): void => null)
        .addRequestValidator((msg: AssistantV1.MessageRequest): void => {
          const errorText: string = msg.context.response.error;
          return expect(
            errorText.startsWith('Error: Conversation service Mock: request validation failed - '),
          ).toStrictEqual(true);
        });
      const request = new MessageRequestMock();
      const watson = new WatsonWrapper(this.logger, adapter, services, [], [], request);
      await watson.getResponse();
    });
  }

  /**
   * Tests that a simple conversation service with no request/response validation results in
   * a second watson call and that the service response is correctly mapped to the watson context
   * of this second call
   */
  private convesationServiceWithoutValidationTest(): void {
    it('conversation-service-without-validation', async () => {
      expect.assertions(1);
      const services = new ConversationServicesMock();
      const service: ConversationServiceMock = new ConversationServiceMock({
        logger: this.logger,
        services,
        requestValidation: false,
        responseValidation: false,
      });
      service.response = { a: 'A' };
      services.serviceMock = service;
      await service.loadSchemas();
      const adapter = new ConversationAPIMock()
        .addResponse(MessageResponseMock.okResponseWithResult(this.getWatsonSimpleRequest()))
        .addRequestValidator((): void => null)
        .addRequestValidator((msg: AssistantV1.MessageRequest): void => {
          const { context, intents } = msg;
          return expect({ context, intents }).toStrictEqual({
            context: {
              response: {
                result: { a: 'A' },
              },
              ...this.getWatsonSimpleRequestCleanedCtx(),
            },
            intents: [
              {
                intent: 'response1',
                confidence: 1.0,
              },
            ],
          });
        });
      const request = new MessageRequestMock();
      const watson = new WatsonWrapper(this.logger, adapter, services, [], [], request);
      await watson.getResponse();
    });
  }

  /**
   * An error must be thrown if the conversation service requires a response validation and
   * the returned object is not in line with the corresponding JSON schema
   */
  private conversationServiceInvalidResponseTest(): void {
    it('conversation-service-invalid-response', async () => {
      expect.assertions(1);
      const services = new ConversationServicesMock();
      const service: ConversationServiceMock = new ConversationServiceMock({
        logger: this.logger,
        services,
        requestValidation: false,
        responseValidation: true,
      });
      service.response = { PARAM1: 'A' };
      services.serviceMock = service;
      services.schemaPathToSchema.set(
        `${this.schemaDir}/response/Mock.json`,
        JSON.stringify(this.getSimpleJsonSchema('number')),
      );
      await service.loadSchemas();
      const adapter = new ConversationAPIMock().addResponse(
        MessageResponseMock.okResponseWithResult(this.getWatsonSimpleRequest()),
      );
      const request = new MessageRequestMock();
      const watson = new WatsonWrapper(this.logger, adapter, services, [], [], request);
      try {
        await watson.getResponse();
      } catch (e) {
        const instanceTest = e instanceof SchemaValidationException;
        const text = 'Error: Conversation service Mock: response validation failed - ';
        const textTest = e.toString().startsWith(text);
        return expect(instanceTest && textTest).toStrictEqual(true);
      }
    });
  }

  /**
   * The failure of the conversation service must result in a second watson call; information about
   * the failure must be correclty propagated to the watson context
   */
  private conversationServiceFailureTest(): void {
    it('conversation-service-failure', async () => {
      expect.assertions(1);
      const services = new ConversationServicesMock();
      const service: ConversationServiceMock = new ConversationServiceMock({
        logger: this.logger,
        services,
        requestValidation: false,
        responseValidation: false,
      });
      service.response = new Error('E');
      services.serviceMock = service;
      await service.loadSchemas();
      const adapter = new ConversationAPIMock()
        .addResponse(MessageResponseMock.okResponseWithResult(this.getWatsonSimpleRequest()))
        .addRequestValidator((): void => null)
        .addRequestValidator((msg: AssistantV1.MessageRequest): void => {
          const { context, intents } = msg;
          return expect({ context, intents }).toStrictEqual({
            context: {
              response: { error: 'Error: E' },
              ...this.getWatsonSimpleRequestCleanedCtx(),
            },
            intents: [
              {
                intent: 'error1',
                confidence: 1.0,
              },
            ],
          });
        });
      const request = new MessageRequestMock();
      const watson = new WatsonWrapper(this.logger, adapter, services, [], [], request);
      await watson.getResponse();
    });
  }

  private conversationServiceResponseMappingToRootTest(): void {
    it('conversation-service-response-mapping-to-root', async () => {
      expect.assertions(1);
      const services = new ConversationServicesMock();
      const service: ConversationServiceMock = new ConversationServiceMock({
        logger: this.logger,
        services,
        requestValidation: false,
        responseValidation: false,
      });
      service.response = { a: 'A' };
      services.serviceMock = service;
      await service.loadSchemas();
      const adapter = new ConversationAPIMock()
        .addResponse(
          MessageResponseMock.okResponseWithResult(
            this.getWatsonSimpleRequest({
              'request-resultTarget': '',
            }),
          ),
        )
        .addRequestValidator((): void => null)
        .addRequestValidator((msg: AssistantV1.MessageRequest): void => {
          const { context, intents } = msg;
          return expect({ context, intents }).toStrictEqual({
            context: {
              a: 'A',
              ...this.getWatsonSimpleRequestCleanedCtx({
                'request-resultTarget': '',
              }),
            },
            intents: [
              {
                intent: 'response1',
                confidence: 1.0,
              },
            ],
          });
        });
      const request = new MessageRequestMock();
      const watson = new WatsonWrapper(this.logger, adapter, services, [], [], request);
      await watson.getResponse();
    });
  }

  private conversationServiceResponseMappingToCustomLocTest(): void {
    it('conversation-service-response-mapping-to-custom-location', async () => {
      expect.assertions(1);
      const services = new ConversationServicesMock();
      const service: ConversationServiceMock = new ConversationServiceMock({
        logger: this.logger,
        services,
        requestValidation: false,
        responseValidation: false,
      });
      service.response = { a: 'A' };
      services.serviceMock = service;
      await service.loadSchemas();
      const adapter = new ConversationAPIMock()
        .addResponse(
          MessageResponseMock.okResponseWithResult(
            this.getWatsonSimpleRequest({
              'request-resultTarget': 'my.special.location',
            }),
          ),
        )
        .addRequestValidator((): void => null)
        .addRequestValidator((msg: AssistantV1.MessageRequest): void => {
          const { context, intents } = msg;
          return expect({ context, intents }).toStrictEqual({
            context: {
              my: {
                special: {
                  location: {
                    a: 'A',
                  },
                },
              },
              ...this.getWatsonSimpleRequestCleanedCtx({
                'request-resultTarget': 'my.special.location',
              }),
            },
            intents: [
              {
                intent: 'response1',
                confidence: 1.0,
              },
            ],
          });
        });
      const request = new MessageRequestMock();
      const watson = new WatsonWrapper(this.logger, adapter, services, [], [], request);
      await watson.getResponse();
    });
  }

  private conversationServiceErrorMappingToCustomLocTest(): void {
    it('conversation-service-error-mapping-to-custom-location', async () => {
      expect.assertions(1);
      const services = new ConversationServicesMock();
      const service: ConversationServiceMock = new ConversationServiceMock({
        logger: this.logger,
        services,
        requestValidation: false,
        responseValidation: false,
      });
      service.response = new Error('E');
      services.serviceMock = service;
      await service.loadSchemas();
      const adapter = new ConversationAPIMock()
        .addResponse(
          MessageResponseMock.okResponseWithResult(
            this.getWatsonSimpleRequest({
              'request-errorTarget': 'my.error',
            }),
          ),
        )
        .addRequestValidator((): void => null)
        .addRequestValidator((msg: AssistantV1.MessageRequest): void => {
          const { context, intents } = msg;
          return expect({ context, intents }).toStrictEqual({
            context: {
              my: { error: 'Error: E' },
              ...this.getWatsonSimpleRequestCleanedCtx({
                'request-errorTarget': 'my.error',
              }),
            },
            intents: [
              {
                intent: 'error1',
                confidence: 1.0,
              },
            ],
          });
        });
      const request = new MessageRequestMock();
      const watson = new WatsonWrapper(this.logger, adapter, services, [], [], request);
      await watson.getResponse();
    });
  }

  private conversationServiceUnsupportedPrimitiveResponseMappingTest(): void {
    it('conversation-service-unsupported-primitive-response-mapping', async () => {
      expect.assertions(1);
      const services = new ConversationServicesMock();
      const service: ConversationServiceMock = new ConversationServiceMock({
        logger: this.logger,
        services,
        requestValidation: false,
        responseValidation: false,
      });
      service.response = 0;
      services.serviceMock = service;
      await service.loadSchemas();
      const adapter = new ConversationAPIMock().addResponse(
        MessageResponseMock.okResponseWithResult(
          this.getWatsonSimpleRequest({
            'request-resultTarget': '',
          }),
        ),
      );
      const request = new MessageRequestMock();
      const watson = new WatsonWrapper(this.logger, adapter, services, [], [], request);
      return expect(watson.getResponse()).rejects.toStrictEqual(
        new ConversationServiceRuntimeException(
          "Not possible to map primitive value '0' to context",
        ),
      );
    });
  }

  async test(): Promise<void> {
    this.conversationServiceUnknownServiceTest();
    this.conversationServiceRequestComputationTest();
    this.conversationServiceInvalidRequestTest();
    this.convesationServiceWithoutValidationTest();
    this.conversationServiceInvalidResponseTest();
    this.conversationServiceFailureTest();
    this.conversationServiceResponseMappingToRootTest();
    this.conversationServiceResponseMappingToCustomLocTest();
    this.conversationServiceErrorMappingToCustomLocTest();
    this.conversationServiceUnsupportedPrimitiveResponseMappingTest();
  }
}

new WatsonWrapperTest().test();
