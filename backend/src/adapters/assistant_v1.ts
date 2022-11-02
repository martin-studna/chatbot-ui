import AssistantV1 from 'ibm-watson/assistant/v1';
import { BasicAuthenticator } from 'ibm-watson/auth';
import { IConversationAPI } from '../interface/IConversationAPI';
import { Logger } from '../class/Logger/Logger';

export class AssistantV1Adapter implements IConversationAPI {
  workspaceId: string;
  assistant: AssistantV1;

  constructor(
    config: {
      passwordOrApikey: string;
      workspaceId: string;
      url?: string;
      username?: string;
      version?: string;
    },
    private logger: Logger,
  ) {
    this.assistant = new AssistantV1({
      version: config.version ? config.version : '2020-02-05',
      authenticator: new BasicAuthenticator({
        username: config.username ? config.username : 'apikey',
        password: config.passwordOrApikey,
      }),
      url: config.url,
    });
    this.workspaceId = config.workspaceId;
  }

  async message(payload: AssistantV1.MessageRequest): Promise<AssistantV1.Response> {
    return new Promise((resolve, reject) => {
      const request = { ...payload, workspaceId: this.workspaceId };
      this.assistant.message(request, (err, payload) => {
        if (err) {
          this.logger.error(`assistant_v1.message() failed; request, error:`, request, err);
          return reject({ message: err.message, stack: err.stack });
        }
        this.logger.info(`assistant_v1.message(); request, response:`, request, payload);
        resolve(payload);
      });
    });
  }
}
