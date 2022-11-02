import { ConversationServiceCloudFunctionCall } from './ConversationServiceCloudFunctionCall';
import { IConversationServiceConfig } from '../../interface/IConversationServiceConfig';

export class ConversationServiceMail extends ConversationServiceCloudFunctionCall {
  // TODO: move to some configuration
  private static url =
    'https://eu-de.functions.cloud.ibm.com/api/v1/web/5e3adb04-4440-4685-a2ae-ced544dffc16/default/nodemailerAction.json';

  constructor(protected config: IConversationServiceConfig) {
    super({
      validateRequest: true,
      validateResponse: false,
      ...config,
    } as IConversationServiceConfig);
  }

  /**
   * Overridden method
   */
  protected transformResponse(response: Record<string, any>): Record<string, any> {
    return response.body;
  }
}
