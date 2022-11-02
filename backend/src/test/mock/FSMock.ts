export class FSMock {
  private readdirResult: Array<Array<string>> = [];
  private readdirCounter = 0;
  private promises: Record<string, any>;

  constructor() {
    this.promises = {
      readdir: (): Promise<Array<string>> => this.readdirPromise(),
    };
  }

  public addReadDirResult(files: Array<string>): void {
    this.readdirResult.push(files);
  }

  public async readdirPromise(): Promise<Array<string>> {
    return this.readdirResult[this.readdirCounter++];
  }
}
