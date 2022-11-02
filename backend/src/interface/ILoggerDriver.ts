export interface ILoggerDriver {
  log: (level: string, msg: string, params: Array<any>) => Promise<void>;
}
