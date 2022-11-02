import { IConversationServices } from './interface/IConversationServices';
import { SchemaValidator } from './class/SchemaValidator';
import { ConversationServices } from './class/ConversationServices';
import { ServicesRegistrator } from './class/ServicesRegistrator';
import { ConversationServiceHelloWorld } from './class/ConversationService/ConversationServiceHelloWorld';
import { Logger } from './class/Logger/Logger';

(async (): Promise<void> => {
  const logger: Logger = new Logger();
  const registrator = new ServicesRegistrator(logger);
  const registeredServices: IConversationServices = registrator.getConversationServices();
  const servicesToValidate: IConversationServices = new ConversationServices([
    ...registeredServices.getServices(),
    new ConversationServiceHelloWorld({ logger }),
  ]);
  const validator = new SchemaValidator(servicesToValidate);

  try {
    await validator.validate();
  } catch (e) {
    process.stderr.write(e.toString());
    throw e;
  }
})();
