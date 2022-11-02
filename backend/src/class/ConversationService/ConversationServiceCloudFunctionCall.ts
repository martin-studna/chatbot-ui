import https from 'https';
import url from 'url';
import { ConversationService } from './ConversationService';
import { IConversationServiceConfig } from '../../interface/IConversationServiceConfig';

export class ConversationServiceCloudFunctionCall extends ConversationService {
  constructor(protected config: IConversationServiceConfig) {
    super({
      requestValidation: true,
      responseValidation: true,
      ...config,
    });
    this.config = {
      endpoint: '',
      ...config,
    } as IConversationServiceConfig;
  }

  private decodeUrl(urlToDecode: string): Record<string, any> {
    const urlObj = url.parse(urlToDecode);
    const { protocol, hostname, port, pathname: path } = urlObj;
    return { protocol, hostname, port, path };
  }

  /**
   * This method enables to transform the request before it is passed to the conversation service
   */
  protected transformRequest(request: Record<string, any>): Record<string, any> {
    return request;
  }

  /**
   * This method enables to transform the response from the conversation service before
   * it is mapped to the Watson Assistant context
   */
  protected transformResponse(response: Record<string, any>): Record<string, any> {
    return response;
  }

  public async getResponse(request: Record<string, any>): Promise<any> {
    return new Promise((resolve: Function, reject: Function): void => {
      const data: string = JSON.stringify(this.transformRequest(request)).replace(
        /[\u007f-\uffff]/g,
        c =>
          `\\u${c
            .charCodeAt(0)
            .toString(16)
            .slice(-4)}`,
      );
      const reqOptions = {
        ...this.decodeUrl(this.config.endpoint),
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      };
      this.logger.info(
        `${this.constructor.name} - Sending a POST request; options, data:`,
        reqOptions,
        data,
      );
      const req = https
        .request(reqOptions, res => {
          let result = '';
          res.on('data', (chunk: string): void => {
            result += chunk;
          });
          res.on('end', (): void => {
            const response = JSON.parse(result);
            this.logger.info(`${this.constructor.name} - Response received:`, response);
            resolve(this.transformResponse(response));
          });
        })
        .on('error', err => {
          this.logger.info(`${this.constructor.name} - Call failed:`, err);
          reject(err);
        });
      req.write(data);
      req.end();
    });
  }
}
