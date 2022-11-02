import AssistantV1 from 'ibm-watson/assistant/v1';
import AssistantV2 from 'ibm-watson/assistant/v2';
import { IamAuthenticator } from 'ibm-watson/auth';
import { IConversationAPI } from '../interface/IConversationAPI';
import { Logger } from '../class/Logger/Logger';

export class AssistantV2Adapter implements IConversationAPI {
  assistantId: string;
  assistant: AssistantV2;
  withContext: boolean;

  constructor(
    config: {
      apikey: string;
      assistantId: string;
      url?: string;
      version?: string;
      withContext?: boolean;
    },
    private logger: Logger,
  ) {
    this.assistant = new AssistantV2({
      version: config.version ? config.version : '2020-04-01',
      authenticator: new IamAuthenticator({
        apikey: config.apikey,
      }),
      url: config.url,
    });
    this.assistantId = config.assistantId;
    this.withContext = config.withContext ? config.withContext : false;
  }

  async message(payload: AssistantV1.MessageRequest): Promise<AssistantV1.Response> {
    if (payload.input.text) {
      payload.input['message_type'] = 'text';
    }
    if (this.withContext) {
      payload.input.options = { ['return_context']: true };
    }

    // Create session if does not exist
    let sessionId: string;
    if (payload.context && payload.context.sessionId) {
      sessionId = payload.context.sessionId;
      delete payload.context.sessionId;
    } else {
      const res = await this.assistant.createSession({ assistantId: this.assistantId });
      sessionId = res.result.session_id;
    }
    let res: AssistantV2.Response<AssistantV2.MessageResponse>;
    const request = {
      assistantId: this.assistantId,
      sessionId: sessionId,
      input: payload.input,
      context: this.withContext
        ? { skills: { ['main skill']: { ['user_defined']: payload.context } } }
        : undefined,
    };
    try {
      res = await this.assistant.message(request);
      this.logger.info(`assistant_v2.message(); request, response:`, request, res);
    } catch (e) {
      if (e.message == 'Invalid Session') {
        this.logger.warn(`assistant_v2.message() failed; request, error:`, request, e);
        sessionId = (await this.assistant.createSession({ assistantId: this.assistantId })).result
          .session_id;
        const request2 = {
          assistantId: this.assistantId,
          sessionId: sessionId,
          input: payload.input,
          context: this.withContext
            ? { skills: { ['main skill']: { ['user_defined']: payload.context } } }
            : undefined,
        };
        try {
          res = await this.assistant.message(request2);
          this.logger.info(`assistant_v2.message(); request, response:`, request2, res);
        } catch (e2) {
          this.logger.error(`assistant_v2.message() failed; request, error:`, request, e2);
          throw e2;
        }
      } else {
        throw e;
      }
    }

    let v1output = res.result.output;
    if (v1output.user_defined) {
      v1output = { ...v1output, ...v1output.user_defined };
      delete v1output.user_defined;
    }
    const newPayload: AssistantV1.Response = {
      headers: res.headers,
      status: res.status,
      statusText: res.statusText,
      result: {
        ...res.result,
        output: v1output,
        input: payload.input,
        context: {
          ...(this.withContext ? res.result.context.skills['main skill'].user_defined : {}),
          sessionId,
        },
      },
    };
    this.logger.info(`assistant_v2.message(); response transformed to V1 format:`, newPayload);
    return newPayload;
  }
}
