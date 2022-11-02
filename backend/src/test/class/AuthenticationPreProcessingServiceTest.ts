import { JWTService } from '../../lib/JWT/JWTService';
import { MessageRequestMock } from '../mock/MessageRequestMock';
import { UserMock } from '../mock/UserMock';
import { AuthenticationPreProcessingService } from '../../class/PreProcessingService/AuthenticationPreProcessingService';
import { Logger } from '../../class/Logger/Logger';
require('dotenv').config();

export class AuthenticationPreProcessingServiceTest {
  private logger: Logger = new Logger();
  private authService = new AuthenticationPreProcessingService(this.logger);
  private jwtService = new JWTService();
  private user = new UserMock();

  private async givenUserAuthenticatedWhenConversationCalledThenAuthenticationContextSet(): Promise<
    void
  > {
    it('givenUserAuthenticatedWhenConversationCalledThenAuthenticationContextSet', async () => {
      expect.assertions(1);
      const request = new MessageRequestMock();
      const token = await this.jwtService.sign(this.user.toPlainObj(), process.env.jwt_secret);
      request.context.jsonWebToken = token;
      await this.authService.processRequest(request);
      const result = 'true';
      return expect(request.context.internal.authentication.isAuthenticated).toStrictEqual(result);
    });
  }

  private async givenUserNotAuthenticationWhenConversationCalledThenAuthenticationContextNotSet(): Promise<
    void
  > {
    it('givenUserNotAuthenticationWhenConversationCalledThenAuthenticationContextNotSet', async () => {
      expect.assertions(1);
      const request = new MessageRequestMock();
      request.context.jsonWebToken = '';
      await this.authService.processRequest(request);
      return expect(
        request.context.internal &&
          request.context.internal.authentication &&
          request.context.internal.authentication.isAuthenticated,
      ).toBeUndefined();
    });
  }

  private async givenAuthenticationContextSetWhenAuthTokenExpiresThenAuthenticationContextRemoved(): Promise<
    void
  > {
    it('givenAuthenticationContextSetWhenAuthTokenExpiresThenAuthenticationContextRemoved', async () => {
      expect.assertions(1);
      const request = new MessageRequestMock();
      request.context.internal = {
        authentication: {
          isAuthenticated: 'true',
          user: {
            firstName: 'Biff',
            surname: 'Flip',
            mail: 'flip@biff.com',
          },
        },
      };
      const expiredToken = { ...this.user.toPlainObj(), exp: Math.floor(Date.now() / 1000) - 30 };
      const token = await this.jwtService.sign(expiredToken, process.env.jwt_secret);
      request.context.jsonWebToken = token;
      await this.authService.processRequest(request);
      return expect(request.context.internal.authentication.isAuthenticated).toStrictEqual(false);
    });
  }

  async test(): Promise<void> {
    this.givenAuthenticationContextSetWhenAuthTokenExpiresThenAuthenticationContextRemoved();
    this.givenUserAuthenticatedWhenConversationCalledThenAuthenticationContextSet();
    this.givenUserNotAuthenticationWhenConversationCalledThenAuthenticationContextNotSet();
  }
}

new AuthenticationPreProcessingServiceTest().test();
