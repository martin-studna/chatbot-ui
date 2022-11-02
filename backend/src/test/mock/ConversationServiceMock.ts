import { ConversationService } from '../../class/ConversationService/ConversationService';

export class ConversationServiceMock extends ConversationService {
  public response: any;
  public requestValidator: (request: Record<string, any>) => void = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getResponse(request: Record<string, any>): Promise<Record<string, any>> {
    if (this.requestValidator) {
      this.requestValidator(request);
    }
    if (this.response instanceof Error) {
      throw this.response;
    }
    return this.response;
  }

  public hasRequestValidation(): boolean {
    return this.config.requestValidation;
  }

  public hasResponseValidation(): boolean {
    return this.config.responseValidation;
  }
}
