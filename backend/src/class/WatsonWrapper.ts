import { IPostprocessingService } from './../interface/IPostprocessingService';
import AssistantV1 from 'ibm-watson/assistant/v1';
import { ConversationService } from './ConversationService/ConversationService';
import { IConversationAPI } from '../interface/IConversationAPI';
import { IConversationServices } from '../interface/IConversationServices';
import { ConversationServiceValidationException } from '../exception/ConversationServiceValidationException';
import { ConversationServiceRuntimeException } from '../exception/ConversationServiceRuntimeException';
import { IPreprocessingService } from '../interface/IPreprocessingService';
import { Logger } from './Logger/Logger';

/**
 * This class
 *   1) pre-process the request to be sent to Watson
 *   2) transparently calls watson repeatedly if a conversation service call
 *      is reqested in the context
 */
export class WatsonWrapper {
  private static successIntent = 'response';
  private static failureIntent = 'error';
  private static requestPrefix = 'request-';
  private static defaultResultPathInWatsonCtx = 'response.result';
  private static defaultErrorPathInWatsonCtx = 'response.error';
  private watsonReq: AssistantV1.MessageRequest;
  // if Conversation Services are used then watson is called more than once for
  // just one utterance and all watson responses must be taken into account
  // when preparing the final response for the client (therefore it is array)
  private watsonRes: Array<AssistantV1.Response> = [];
  private preProcessedReq: AssistantV1.MessageRequest;
  private conversationServiceName: string;
  private conversationService: ConversationService;
  private conversationServiceReq: Record<string, any>;
  private conversationServiceRes: Record<string, any>;
  private conversationServiceError: Record<string, any>;
  private callNum: number;

  constructor(
    private logger: Logger,
    private adapter: IConversationAPI,
    private conversationServices: IConversationServices,
    private preProcessingServices: Array<IPreprocessingService>,
    private postProcessingServices: Array<IPostprocessingService>,
    private request: AssistantV1.MessageRequest,
  ) {}

  private copyWatsonReqFrom(source: AssistantV1.MessageRequest): void {
    this.watsonReq = { ...source };
  }

  private copyContextFromResToReq(): void {
    const watsonRes = this.watsonRes[this.watsonRes.length - 1];
    this.watsonReq.context = Object.entries(watsonRes.result.context).reduce(
      (result: Record<string, any>, [key, val]): Record<string, any> => {
        if (key.startsWith(WatsonWrapper.requestPrefix)) {
          result[key] = null;
        } else {
          result[key] = val;
        }
        return result;
      },
      {},
    );
  }

  private async callWatson(): Promise<void> {
    const watsonRes = await this.callWatsonMessage(this.watsonReq);
    this.watsonRes.push(watsonRes);
  }

  private async getConversationService(): Promise<void> {
    await this.conversationServices.getSchemasOnFS();
    this.conversationService = this.conversationServices.getServiceByName(
      this.conversationServiceName,
    );
    await this.conversationService.loadSchemas();
  }

  private async callConversationService(): Promise<void> {
    this.conversationServiceReq = this.getConversationServiceRequest();
    try {
      this.conversationService.validateRequest(this.conversationServiceReq);
      this.conversationServiceRes = await this.conversationService.getResponse(
        this.conversationServiceReq,
      );
      this.logger.info(
        `${this.constructor.name}: Conversation service ${this.conversationServiceName} call; ` +
          `request, response:`,
        this.conversationServiceReq,
        this.conversationServiceRes,
      );
    } catch (e) {
      this.conversationServiceError = e.toString();
      this.logger.error(
        `${this.constructor.name}: Conversation service ${this.conversationServiceName} failed; ` +
          `request, error:`,
        this.conversationServiceReq,
        e,
      );
    }
  }

  public async getResponse(): Promise<AssistantV1.Response> {
    this.preProcessedReq = { ...this.request };
    for (const preProcessorService of this.preProcessingServices) {
      await preProcessorService.processRequest(this.preProcessedReq);
    }
    this.copyWatsonReqFrom(this.preProcessedReq);
    for (this.callNum = 1; true; this.callNum++) {
      await this.callWatson();
      this.copyWatsonReqFrom(this.preProcessedReq);
      this.copyContextFromResToReq();
      if (this.conversationServiceCallRequired()) {
        this.validateServiceName();
        await this.getConversationService();
        this.conversationServiceError = null;
        await this.callConversationService();
        if (this.conversationServiceError) {
          this.addFailureIntentToWatsonReq();
          this.addConversationServiceErrorToWatsonReq();
        } else {
          this.conversationService.validateResponse(this.conversationServiceRes);
          this.addSuccessIntentToWatsonReq();
          this.addConversationServiceResultToWatsonReq();
        }
      } else {
        return await this.getFinalWatsonRes();
      }
    }
  }

  private async getFinalWatsonRes(): Promise<AssistantV1.Response> {
    const watsonRes = this.getMergedWatsonRes();
    for (const postProcessorService of this.postProcessingServices) {
      await postProcessorService.processResponse(watsonRes);
    }
    return watsonRes;
  }

  // Merges all responses in this.watsonRes into just one response
  private getMergedWatsonRes(): AssistantV1.Response {
    if (this.watsonRes.length > 1) {
      const response: AssistantV1.Response = {
        ...this.watsonRes[this.watsonRes.length - 1],
      };
      if (response.result) {
        response.result = { ...response.result };
      }
      if (response.result.output) {
        response.result.output = { ...response.result.output };
      }
      if (response.result.output) {
        ['generic', 'log_messages', 'nodes_visited', 'text'].forEach((key: string): void => {
          const value = [];
          this.watsonRes.forEach((res: AssistantV1.Response): void => {
            if (res.result.output[key]) {
              res.result.output[key].forEach((item: any): void => {
                value.push(item);
              });
            }
          });
          response.result.output[key] = value;
        });
      }
      this.logger.info(`${this.constructor.name}: merged watson response`, response);
      return response;
    }
    return this.watsonRes[0];
  }

  private addFailureIntentToWatsonReq(): void {
    this.addIntentToWatsonReq(`${WatsonWrapper.failureIntent}${this.callNum}`);
  }

  private addSuccessIntentToWatsonReq(): void {
    this.addIntentToWatsonReq(`${WatsonWrapper.successIntent}${this.callNum}`);
  }

  private addIntentToWatsonReq(intentName: string): void {
    this.watsonReq.intents = [
      {
        intent: intentName,
        confidence: 1.0,
      },
    ];
  }

  /**
   * Returns a function that can map the provided value to the given
   * path of the watson context; the returned function can handle both
   * primitive typed parameter as well as an object
   */
  private createMapperToWatsonReqContext(path: string): (value: any) => void {
    return (value: any): void => {
      this.watsonReq.context = this.watsonReq.context || {};
      let ctx: Record<string, any> = this.watsonReq.context;
      if (path === '') {
        if (value instanceof Object) {
          Object.assign(ctx, value);
        } else {
          throw new ConversationServiceRuntimeException(
            `Not possible to map primitive value '${value}' to context`,
          );
        }
      } else {
        const parts: Array<string> = path.split('.');
        parts.forEach((key: string, i: number): void => {
          if (i < parts.length - 1) {
            ctx[key] = ctx[key] || {};
            ctx = ctx[key];
          } else {
            if (value instanceof Object) {
              ctx[key] = { ...value };
            } else {
              ctx[key] = value;
            }
          }
        });
      }
    };
  }

  private addConversationServiceErrorToWatsonReq(): void {
    let path: string = this.getRequestDirectiveFromWatsonRes('errorTarget');
    path = path === null ? WatsonWrapper.defaultErrorPathInWatsonCtx : path;
    this.createMapperToWatsonReqContext(path)(this.conversationServiceError);
  }

  private addConversationServiceResultToWatsonReq(): void {
    let path: string = this.getRequestDirectiveFromWatsonRes('resultTarget');
    path = path === null ? WatsonWrapper.defaultResultPathInWatsonCtx : path;
    this.createMapperToWatsonReqContext(path)(this.conversationServiceRes);
  }

  private conversationServiceCallRequired(): boolean {
    return this.getConversationServiceName() !== null;
  }

  private getRequestDirectiveFromWatsonRes(param: string): any {
    const contextKey = `${WatsonWrapper.requestPrefix}${param}`;
    const watsonRes = this.watsonRes[this.watsonRes.length - 1];
    return watsonRes.result &&
      watsonRes.result.context &&
      watsonRes.result.context[contextKey] !== undefined
      ? watsonRes.result.context[contextKey]
      : null;
  }

  private getConversationServiceName(): string {
    return this.getRequestDirectiveFromWatsonRes('service');
  }

  private validateServiceName(): void {
    const serviceName: string = this.getConversationServiceName();
    if (this.conversationServices.getServiceByName(serviceName) === undefined) {
      const target = `$${WatsonWrapper.requestPrefix}service`;
      throw new ConversationServiceValidationException(
        `Conversation service '${serviceName}' received in ${target} not registered`,
      );
    }
    this.conversationServiceName = serviceName;
  }

  private getConversationServiceRequest(): Record<string, any> {
    const regex = new RegExp(`^${WatsonWrapper.requestPrefix}params-`);
    const watsonRes = this.watsonRes[this.watsonRes.length - 1];
    return Object.entries(watsonRes.result.context).reduce(
      (result: Record<string, any>, [k, v]) => {
        if (regex.test(k) && v !== null) {
          let current = result;
          const path: Array<string> = k.replace(regex, '').split('-');
          path.forEach((key: string, i: number) => {
            if (i < path.length - 1) {
              current[key] = current[key] || {};
              current = current[key];
            } else {
              current[key] = v;
            }
          });
        }
        return result;
      },
      {},
    );
  }

  private async callWatsonMessage(
    request: AssistantV1.MessageRequest,
  ): Promise<AssistantV1.Response> {
    const watsonRequest: AssistantV1.MessageRequest = { ...request };
    return this.adapter.message(watsonRequest);
  }
}
