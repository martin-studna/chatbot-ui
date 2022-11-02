import express, { Router, Request, Response } from 'express';
import { v1 as uuidv1 } from 'uuid';
require('dotenv').config();
import { IConversationServices } from '../interface/IConversationServices';
import { IConversationAPI } from '../interface/IConversationAPI';
import { WatsonWrapper } from '../class/WatsonWrapper';
import { ServicesRegistrator } from '../class/ServicesRegistrator';
import { Logger } from '../class/Logger/Logger';

export function conversationAPI(logger: Logger): (watsonAdapter: IConversationAPI) => Router {
  const registrator = new ServicesRegistrator(logger);
  const preProcessingServices = registrator.getPreprocessingServices();
  const postProcessingServices = registrator.getPostProcessingServices();
  const conversationServices: IConversationServices = registrator.getConversationServices();

  return (watsonAdapter: IConversationAPI): Router => {
    const router: Router = express.Router();

    router.use(express.json({ limit: '1mb' }));
    router.get('/(|v1/)workspaces', (req: Request, res: Response) => {
      return res.json({
        workspaces: [
          {
            workspaceId: 'default',
            name: 'default',
          },
        ],
      });
    });

    router.post('/(|v1/)workspaces/default/message', async (req: Request, res: Response) => {
      const payload = req.body;
      if (!payload.input) {
        res.status(400);
        res.send('missing input');
      }
      try {
        const watson = new WatsonWrapper(
          logger,
          watsonAdapter,
          conversationServices,
          preProcessingServices,
          postProcessingServices,
          payload,
        );
        const newPayload = await watson.getResponse();
        res.json({ ...newPayload, id: uuidv1(), date: new Date() });
      } catch (e) {
        res.json({
          id: uuidv1(),
          date: new Date(),
          result: {
            input: payload.input,
            error: e.message,
          },
        });
      }
    });

    return router;
  };
}
