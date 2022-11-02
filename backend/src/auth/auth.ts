import express, { Router, Response, Request } from 'express';
import * as graph from '../lib/Azure/Graph';
import { IUser } from '../interface/IUser';
import { JWTService } from '../lib/JWT/JWTService';
import { Logger } from '../class/Logger/Logger';

export const authentication = (logger: Logger): Router => {
  const router: Router = express.Router();
  const jwtService = new JWTService();
  router.use(express.json({ limit: '1mb' }));

  async function handleAuth(userToken: string): Promise<any> {
    const azureUser: any = await graph.getUserDetails(userToken);
    if (azureUser) {
      logger.info('Retrieved data about user: ', azureUser);
      const user: IUser = { ...azureUser };
      return await jwtService.sign(user, process.env.jwt_secret);
    }
  }

  /**
   * `/userInfo` route gets user access token for user data retrieval from Azure Active Directory.
   * After retrieving user data from azure AD, it creates json web token.
   */
  router.post('/userInfo', (req: Request, res: Response) => {
    handleAuth(req.body.userToken)
      .then(token => {
        res.json({ token });
      })
      .catch(err => {
        logger.error(err.message, err);
        res.status(401).json({ message: err.message });
      });
  });
  return router;
};
