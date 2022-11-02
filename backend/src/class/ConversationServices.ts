import * as filesystem from 'fs';
import { IConversationServices } from '../interface/IConversationServices';
import { ConversationService } from './ConversationService/ConversationService';

export class ConversationServices implements IConversationServices {
  private services: Map<string, ConversationService>;
  private schemasOnFS: Set<string> = null;

  constructor(
    private serviceArray: Array<ConversationService> = [],
    private fs: Record<string, any> = filesystem,
  ) {
    this.services = new Map();
    serviceArray.forEach((service: ConversationService) => {
      this.services.set(service.getServiceName(), service);
      service.setServices(this);
    });
  }

  public getObligatorySchemas(): Set<string> {
    return new Set([].concat(...[...this.services.values()].map(s => s.getObligatorySchemas())));
  }

  public getOptionalSchemas(): Set<string> {
    return new Set([].concat(...[...this.services.values()].map(s => s.getOptionalSchemas())));
  }

  public static absolutePath(path: string): string {
    // TODO: The implementation of this method should rather make use of
    // path.normalize(). However for me it is throwing some strange exception
    // related to utf conversion (jan_nemecek@cz.ibm.com)
    const dir: string = process.env.JSON_SCHEMA_DIR
      ? process.env.JSON_SCHEMA_DIR
      : `${__dirname}/../jsonschema`;
    const parts = `${dir}/${path}`
      .split('/')
      .filter((part: string): boolean => part !== '' && part !== '.');
    return (
      '/' +
      parts
        .reduce((result, part) => {
          if (part == '..') {
            result.pop();
          } else {
            result.push(part);
          }
          return result;
        }, [])
        .join('/')
    );
  }

  public async getSchemasOnFS(): Promise<Set<string>> {
    if (this.schemasOnFS === null) {
      this.schemasOnFS = new Set();
      const dirs: Array<string> = ['request', 'response'].map((path: string) =>
        ConversationServices.absolutePath(path),
      );
      await Promise.all(
        dirs.map(
          (dirPath: string): Promise<void> => {
            return (async (): Promise<void> => {
              const files = await this.fs.promises.readdir(dirPath);
              files.forEach((f: string) => {
                if (/\.json$/.test(f)) {
                  this.schemasOnFS.add(`${dirPath}/${f}`);
                }
              });
            })();
          },
        ),
      );
    }
    return this.schemasOnFS;
  }

  public async isSchemaOnFS(path: string): Promise<boolean> {
    return (await this.getSchemasOnFS()).has(path);
  }

  public async getSchemaAsStr(path: string): Promise<string> {
    return this.fs.promises.readFile(path, { encoding: 'utf8' });
  }

  /**
   * Regístters all conversation services present on the filesystem
   */
  public async registerAllServices(): Promise<void> {
    const dirName = 'src/class/ConversationService';
    const files: Array<string> = await this.fs.promises.readdir(dirName);
    await Promise.all(
      files.map(
        (f: string): Promise<void> => {
          return (async (): Promise<void> => {
            if (/ConversationService[^.]+\.ts$/.test(f)) {
              const serviceName: string = f.replace(/^ConversationService(.*)\.ts$/, '$1');
              await this.registerService(serviceName);
            }
          })();
        },
      ),
    );
  }

  /**
   * Registers the service by name; the name is entered without the class name
   * prefix 'ConversationService'
   */
  public async registerService(serviceName: string): Promise<void> {
    const className = `ConversationService${serviceName}`;
    const path = `./ConversationService/${className}`;
    await import(path).then((code: Record<string, any>): void => {
      const service: ConversationService = new (code as any)[className](this);
      this.services.set(serviceName, service);
    });
  }

  public getServiceByName(serviceName: string): ConversationService {
    return this.services.get(serviceName);
  }

  public getServices(): Array<ConversationService> {
    return [...this.services.values()];
  }
}
