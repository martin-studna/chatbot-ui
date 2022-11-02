import { WatsonDiscovery } from '../../lib/WatsonDiscovery/WatsonDiscovery';
import { IPostprocessingService } from '../../interface/IPostprocessingService';
import AssistantV1, { Response } from 'ibm-watson/assistant/v1';
import { Logger } from '../Logger/Logger';

export class WatsonDiscoveryPostProcessingService implements IPostprocessingService {
  constructor(private watsonDiscovery: WatsonDiscovery, private logger: Logger) {}

  public async processResponse(response: Response<AssistantV1.MessageResponse>): Promise<void> {
    const count = (process.env.discovery_max_results || 3) as number;

    for (const [i, val] of response.result.output.generic.entries()) {
      if (val.response_type === 'search_skill') {
        await this.watsonDiscovery
          .getQueryResults(response.result.output.query, null, count)
          .then(discoveryResponse => {
            this.logger.info('Discovery results: ', discoveryResponse.result.results);

            if (discoveryResponse && discoveryResponse.result.results.length) {
              const discoveryResult = {
                response_type: 'search', // eslint-disable-line @typescript-eslint/camelcase
                header: process.env.discovery_header || 'Results:',
                results: discoveryResponse.result.results,
              };
              response.result.output.generic[i] = discoveryResult;
            }
          });
      }
    }
  }
}
