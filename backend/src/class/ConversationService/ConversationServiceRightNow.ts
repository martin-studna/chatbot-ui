import { ConversationServiceCloudFunctionCall } from './ConversationServiceCloudFunctionCall';
import { IConversationServiceConfig } from '../../interface/IConversationServiceConfig';

export class ConversationServiceRightNow extends ConversationServiceCloudFunctionCall {
  // TODO: move to some configuration
  private static url =
    'https://eu-de.functions.cloud.ibm.com/api/v1/web/5e3adb04-4440-4685-a2ae-ced544dffc16/default/webhookIT.json';

  constructor(protected config: IConversationServiceConfig) {
    super({
      validateRequest: true,
      validateResponse: false,
      ...config,
      endpoint: ConversationServiceRightNow.url,
    } as IConversationServiceConfig);
  }
}
