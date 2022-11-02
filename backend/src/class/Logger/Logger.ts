import { ILoggerDriver } from '../../interface/ILoggerDriver';
import { LoggerDriverConsole } from './LoggerDriverConsole';

export class Logger {
  constructor(private driver: ILoggerDriver = new LoggerDriverConsole()) {}

  public async error(msg: string, ...params: Array<any>): Promise<void> {
    this.driver.log('error', msg, params);
  }

  public async warn(msg: string, ...params: Array<any>): Promise<void> {
    this.driver.log('warn', msg, params);
  }

  public async info(msg: string, ...params: Array<any>): Promise<void> {
    this.driver.log('info', msg, params);
  }
}
