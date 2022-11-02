import { ILoggerDriver } from '../../interface/ILoggerDriver';

export class LoggerDriverConsole implements ILoggerDriver {
  public async log(level: string, msg: string, params: Array<any>): Promise<void> {
    const msgToLog = `[${new Date().toISOString().replace(/\..*/, '')}] ${msg}`;
    return console[level](msgToLog, ...params);
  }
}
