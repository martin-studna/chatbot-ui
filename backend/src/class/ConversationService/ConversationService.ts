/**
 * An interface for a class implementing a service which may be called from
 * the conversation.
 *
 * The approach how to call such service from the conversation is:
 *   1) Populate the context variable $request-service with the name of the
 *      service to be called.
 *   2) Populate (typically in the same node) the input parameters relevant
 *      for the selected service. All parameters are prefixed with
 *      $request-params (so the complete name for each parameter is
 *      $request-params-PARAM_NAME resp. $request-params-KEY-NESTED_KEY in
 *      case of a hierarchical request structure).
 *   3) Optionally we may populate also $request-resultTarget and
 *      $request-errorTarget. The first one defaults to 'response.result' and
 *      the second one to 'response.error' which means that in case of success
 *      the service result will be written to the Watson context variable
 *      $response.result and in case of failure the error object will be
 *      written to the context variable $response.error.  If we need to covert
 *      existing Watson skill which uses e. g. direct cloud function calls to a
 *      solution with conversation services and we want to minimize the impact
 *      on the skill then it may be convenient to use these parameters.  to
 *      align the output with existing implementation.  Setting
 *      $request-resultTarget or $error-errorTarget to an empty string will
 *      cause that the data will be written directly to the context root.  For
 *      new implementations we should always use the default locations.
 *   4) Respond with some text (possibly empty). If there are more conversation
 *      service calls within one chat response, the texts defined in watson
 *      assistant are joined into one response.
 *      Once the service returns the application, it will populate Watson context
 *      $response variable and it will call Watson again with a forced intent
 *      #response1 or #error1. The conversation is expected to:
 *        1. Handle the intent #response1 and
 *             a) return some response which typically uses the returned result
 *                $response.result - the format of this object is specific for
 *                each service).
 *             b) or make another call by populating $request (unlike usual
 *                context variables the application cleans $request with each
 *                Watson call so the conversation developer does not need to
 *                care about the values stored in $request before the previous
 *                call). In this case the result is communicated to
 *                the conversation as a forced intent #response2 resp. #error2
 *                (#response3, #response4 etc. - the incrementing is reset
 *                once we stop filling $request and return a standard response
 *                to the chat user).
 *        2. Handle the intent #error1 and communicate the problem to the chat
 *           user. Error details are stored in $response.error.
 *
 * In order to define a new service callable from the Watson skill we have to:
 *   1) Implement a class extending ConversationService in
 *      src/class/ConversationService (e. g. ConversationServiceHelloWorld.ts).
 *   2) Define the structure of the request and the response in a JSON schema
 *      stored in the directories src/jsonschema/request and
 *      src/jsonschema/response (e. g. src/jsonschema/request/HelloWorld.json and
 *      src/jsonschema/response/HelloWorld.json - the name must match with
 *      the name of the service). Don't forget to fill in all
 *      descriptions as the schemas will be used for generating of the
 *      documentation).
 *      For PoCs we may skip JSON schemas by setting the conversation
 *      service properties 'requestValidation' and 'responseValidation'
 *      to false - in this case json schemas are not required. It also makes
 *      sense to set 'responseValidation' to false in production in case
 *      the conversion service is passing the result of an external call
 *      which is weakly typed. However it still makes sense to have the
 *      response JSON schema which will be used for the generation of the
 *      documentation.
 *   3) Register the service in src/api/conversation.ts
 *      either using ConversationServices.registerService()
 *      or ConversationServices.registerAllServices()
 */
import Ajv from 'ajv';
import { IConversationServices } from '../../interface/IConversationServices';
import { ConversationServices } from '../ConversationServices';
import { SchemaValidationException } from '../../exception/SchemaValidationException';
import { IConversationServiceConfig } from '../../interface/IConversationServiceConfig';
import { Logger } from '../Logger/Logger';

export abstract class ConversationService {
  // a compiled request schema
  protected requestSchema: any = null;
  // a compiled response schema
  protected responseSchema: any = null;

  protected logger: Logger;

  constructor(protected config: IConversationServiceConfig) {
    this.config = {
      services: null,
      requestValidation: true,
      responseValidation: true,
      ...config,
    } as IConversationServiceConfig;
    this.logger = config.logger;
  }

  public setServices(services: IConversationServices): void {
    this.config.services = services;
  }

  public getObligatorySchemas(): Array<string> {
    const retVal: Array<string> = [];
    if (this.config.requestValidation) {
      retVal.push(`${this.getRequestDir()}/${this.getServiceName()}.json`);
    }
    if (this.config.responseValidation) {
      retVal.push(`${this.getResponseDir()}/${this.getServiceName()}.json`);
    }
    return retVal;
  }

  public getOptionalSchemas(): Array<string> {
    const retVal: Array<string> = [];
    if (!this.config.requestValidation) {
      retVal.push(`${this.getRequestDir()}/${this.getServiceName()}.json`);
    }
    if (!this.config.responseValidation) {
      retVal.push(`${this.getResponseDir()}/${this.getServiceName()}.json`);
    }
    return retVal;
  }

  private getRequestDir(): string {
    return ConversationServices.absolutePath('request');
  }

  private getResponseDir(): string {
    return ConversationServices.absolutePath('response');
  }

  public getServiceName(): string {
    return this.constructor.name.replace(/^ConversationService/, '');
  }

  private async getCompiledSchema(path: string, ajv: Record<string, any>): Promise<any> {
    let schemaJson: Record<string, any>;
    try {
      const schemaStr = await this.config.services.getSchemaAsStr(path);
      schemaJson = JSON.parse(schemaStr);
    } catch (e) {
      throw new Error(`Schema ${path}: Invalid JSON - ${e.toString()}`);
    }
    try {
      return ajv.compile(schemaJson);
    } catch (e) {
      throw new Error(`Schema ${path}: Invalid schema - ${e.toString()}`);
    }
  }

  /**
   * @pre ConversationServices.getSchemasOnFS() has already been called
   * @post Compiled json schemas are stored in this.requestSchema and this.responseSchema
   */
  public async loadSchemas(): Promise<void> {
    const reqSchemaPath = `${this.getRequestDir()}/${this.getServiceName()}.json`;
    const resSchemaPath = `${this.getResponseDir()}/${this.getServiceName()}.json`;
    const ajv: Record<string, any> = new Ajv({ validateSchema: true, allErrors: true });
    await Promise.all([
      (async (): Promise<void> => {
        if (!this.requestSchema && (await this.config.services.isSchemaOnFS(reqSchemaPath))) {
          this.requestSchema = await this.getCompiledSchema(reqSchemaPath, ajv);
        }
      })(),
      (async (): Promise<void> => {
        if (!this.responseSchema && (await this.config.services.isSchemaOnFS(resSchemaPath))) {
          this.responseSchema = await this.getCompiledSchema(resSchemaPath, ajv);
        }
      })(),
    ]);
  }

  public validateRequest(request: Record<string, any>): void {
    if (this.requestSchema && this.config.requestValidation) {
      const valid: boolean = this.requestSchema(request);
      if (!valid) {
        const error = `request validation failed - request='${JSON.stringify(request)}'`;
        const details = `, errors='${this.decodeAjvErrors(this.requestSchema.errors)}'`;
        throw new SchemaValidationException(
          `Conversation service ${this.getServiceName()}: ${error}${details}`,
        );
      }
    }
  }

  public validateResponse(response: Record<string, any>): void {
    if (this.responseSchema && this.config.responseValidation) {
      const valid: boolean = this.responseSchema(response);
      if (!valid) {
        const error = `response validation failed - response='${JSON.stringify(response)}'`;
        const details = `, errors='${this.decodeAjvErrors(this.responseSchema.errors)}'`;
        throw new SchemaValidationException(
          `Conversation service ${this.getServiceName()}: ${error}${details}`,
        );
      }
    }
  }

  private decodeAjvErrors(errors: Array<Record<string, any>>): string {
    return errors
      .map((error: Record<string, any>): string => {
        return `${error.dataPath}: ${error.message}`;
      })
      .join(', ');
  }

  public abstract async getResponse(request: Record<string, any>): Promise<any>;
}

module.exports = { ConversationService };
