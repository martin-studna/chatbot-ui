import express, { Application } from 'express';
import cors from 'cors';
import proxy from 'http-proxy-middleware';
import { conversationAPI } from './api/conversation';
import { healthCheckAPI } from './api/healthCheck';
import { IConversationAPI } from './interface/IConversationAPI';
import { AssistantV1Adapter } from './adapters/assistant_v1';
import { AssistantV2Adapter } from './adapters/assistant_v2';
import { authentication } from './auth/auth';
import { Logger } from './class/Logger/Logger';

require('dotenv').config();
const logger: Logger = new Logger();

const app: Application = express();

app.use(express.json({ limit: '1mb' }));

if (process.env.allow_origin) {
  app.use(
    cors({
      origin: process.env.allow_origin,
    }),
  );
}

let conversationAdapter: IConversationAPI;
if (process.env.assistant_id) {
  conversationAdapter = new AssistantV2Adapter(
    {
      url: process.env.assistant_url,
      apikey: process.env.assistant_apikey,
      assistantId: process.env.assistant_id,
    },
    logger,
  );
} else if (process.env.assistant_password) {
  conversationAdapter = new AssistantV1Adapter(
    {
      url: process.env.assistant_url,
      username: process.env.assistant_username,
      passwordOrApikey: process.env.assistant_password,
      workspaceId: process.env.assistant_workspace_id,
    },
    logger,
  );
} else {
  logger.error(
    'Credentials for watson assistant were found neither in connected services nor in env variables',
  );
  process.exit();
}
app.use('/conversation', conversationAPI(logger)(conversationAdapter)); // Watson Assistant conversation middleware - dialogs access
app.use('/auth', authentication(logger)); // Authentication middleware
app.use('/health-check', healthCheckAPI(logger)(conversationAdapter));

/**
 * There are two options for frontend access.
 * 1. The Backend listen to requests from the given url defined in `frontend_proxy` variable.
 * 2. Otherwise the backend takes the static frontend from public folder.
 */
if (process.env.frontend_proxy)
  app.use('/', proxy({ target: process.env.frontend_proxy, changeOrigin: true }));
else app.use(express.static(`${__dirname}/dist/`));

const port = process.env.VCAP_APP_PORT || process.env.port || 3023;
logger.info(`Listening on port: ${port}`);
app.listen(port);
