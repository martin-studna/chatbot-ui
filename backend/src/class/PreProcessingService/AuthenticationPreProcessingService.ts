import AssistantV1 from 'ibm-watson/assistant/v1';
import { JWTService } from '../../lib/JWT/JWTService';
import { IUser } from '../../interface/IUser';
import { IPreprocessingService } from '../../interface/IPreprocessingService';
import { Logger } from '../Logger/Logger';

/**
 * This class is implementing adding of SSO information to WA request. Information is set to context variable
 * internal.authentication. Authentication flow is following:
 * - User is authenticated and JWT token is created to store user data
 * - JWT token is passed by FE in WA request
 * - Service checks presence and validity of JWT token and based on that modifies internal.authentication context
 */
export class AuthenticationPreProcessingService implements IPreprocessingService {
  private context: AssistantV1.Context;
  private jwtService = new JWTService();

  constructor(private logger: Logger) {}

  public async processRequest(request: AssistantV1.MessageRequest): Promise<void> {
    this.logger.info(`${this.constructor.name}: called.`);
    this.context = request.context;
    await this.resolveAuthenticationContext();
    request.context = this.context;
  }

  private async resolveAuthenticationContext(): Promise<void> {
    const authenticated =
      this.context.internal &&
      this.context.internal.authentication &&
      this.context.internal.authentication.isAuthenticated;
    // User has JWT token (authenticated)
    if (this.context.jsonWebToken) {
      try {
        const decodedToken = await this.jwtService.verify(
          this.context.jsonWebToken,
          process.env.jwt_secret,
        );
        // Authenticated context is not set and JWT token is valid
        if (!authenticated) {
          this.addAuthenticationDataToContext(decodedToken as IUser);
        }
      } catch (e) {
        this.logger.warn(`${this.constructor.name}: JWT token not verified:`, e);
        // JWT token invalid and Auth context set
        if (authenticated) {
          this.removeAuthenticationDataFromContext();
        }
      }
    } else {
      // JWT token not present but context set
      if (
        this.context.internal &&
        this.context.internal.authentication &&
        this.context.internal.authentication.isAuthenticated
      ) {
        this.removeAuthenticationDataFromContext();
      }
    }
  }

  private addAuthenticationDataToContext(userData: IUser): void {
    this.logger.info(
      `${this.constructor.name}: Adding authentication context to request:`,
      userData,
    );
    const authentication = {
      isAuthenticated: 'true',
      user: {
        firstName: userData.givenName,
        surname: userData.surname,
        mail: userData.userPrincipalName,
        country: userData.country,
        department: userData.department,
      },
    };
    this.context.internal = this.context.internal || {};
    this.context.internal.authentication = authentication;
  }

  private removeAuthenticationDataFromContext(): void {
    this.logger.info(`${this.constructor.name}: Removing authentication context from request.`);
    this.context.internal = this.context.internal || {};
    this.context.internal.authentication = {
      isAuthenticated: false,
      user: {},
    };
  }
}
