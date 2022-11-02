import express, { Router, Request, Response } from 'express';
import { WatsonWrapper } from '../class/WatsonWrapper';
import { IConversationServices } from '../interface/IConversationServices';
import { ServicesRegistrator } from '../class/ServicesRegistrator';
import { IConversationAPI } from '../interface/IConversationAPI';
import { Logger } from '../class/Logger/Logger';

export function healthCheckAPI(logger: Logger): (watsonAdapter: IConversationAPI) => Router {
  return (watsonAdapter: IConversationAPI): Router => {
    const router: Router = express.Router();
    router.get('/', async (req: Request, res: Response) => {
      try {
        const registrator = new ServicesRegistrator(logger);
        const preProcessingServices = registrator.getPreprocessingServices();
        const postProcessingServices = registrator.getPostProcessingServices();

        const conversationServices: IConversationServices = registrator.getConversationServices();
        const payload = {
          alternate_intents: true, // eslint-disable-line
          context: {},
          input: {
            text: '',
          },
        };
        const watson = new WatsonWrapper(
          logger,
          watsonAdapter,
          conversationServices,
          preProcessingServices,
          postProcessingServices,
          payload,
        );
        await watson.getResponse();
        res.json({ ok: true });
      } catch (e) {
        res.json({ ok: false, error: e.toString() });
      }
    });
    return router;
  };
}
