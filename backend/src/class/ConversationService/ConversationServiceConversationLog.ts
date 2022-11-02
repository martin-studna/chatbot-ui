import { ConversationServiceCloudFunctionCall } from './ConversationServiceCloudFunctionCall';
import { IConversationServiceConfig } from '../../interface/IConversationServiceConfig';

export class ConversationServiceConversationLog extends ConversationServiceCloudFunctionCall {
  // TODO: move to some configuration
  private static url =
    'https://eu-de.functions.cloud.ibm.com/api/v1/web/5e3adb04-4440-4685-a2ae-ced544dffc16/default/getConversationLog.json';

  constructor(protected config: IConversationServiceConfig) {
    super({
      requestValidation: true,
      responseValidation: true,
      ...config,
      endpoint: ConversationServiceConversationLog.url,
    } as IConversationServiceConfig);
  }

  /**
   * Overridden method
   */
  protected transformRequest(request: Record<string, any>): Record<string, any> {
    Object.assign(request, {
      url: process.env.assistant_url.replace(/(https?:\/\/.*?)\/.*/, '$1'),
      // eslint-disable-next-line @typescript-eslint/camelcase
      workspace_id: process.env.assistant_workspace_id,
      // eslint-disable-next-line @typescript-eslint/camelcase
      iam_apikey: process.env.assistant_password,
      version: '2020-02-05',
    });
    return request;
  }

  /**
   * Overridden method
   */
  protected transformResponse(response: Record<string, any>): Record<string, any> {
    return response.body;
  }
}
