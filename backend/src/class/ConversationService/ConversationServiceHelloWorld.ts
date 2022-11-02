import { ConversationService } from './ConversationService';
import { IConversationServiceConfig } from '../../interface/IConversationServiceConfig';

export class ConversationServiceHelloWorld extends ConversationService {
  private greetings: Map<string, string>;

  constructor(protected config: IConversationServiceConfig) {
    super({
      ...config,
      requestValidation: true,
      responseValidation: false,
    });
    this.greetings = new Map();
    this.greetings.set('cz', 'Nazdar');
    this.greetings.set('en', 'Hello');
  }

  public async getResponse(request: Record<string, any>): Promise<any> {
    const msg: string = this.greetings.get(request.lang);
    return {
      message: request.capitalize ? msg.toUpperCase() : msg,
    };
  }
}
