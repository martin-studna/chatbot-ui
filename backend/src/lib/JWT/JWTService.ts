import jwt from 'jsonwebtoken';

export class JWTService {
  public async sign(obj: any, secret: string): Promise<any> {
    return await jwt.sign(obj, secret);
  }

  public async verify(token: any, secret: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          reject('TokenInvalidError.');
        } else {
          resolve(decoded);
        }
      });
    });
  }
}
