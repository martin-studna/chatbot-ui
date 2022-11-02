/**
 * @jest-environment node
 */
import DiscoveryV1 from 'ibm-watson/discovery/v1';
import { DiscoveryResponseMock } from './../mock/DiscoveryResponseMock';
import { WatsonDiscoveryPostProcessingService } from '../../class/PostProcessingService/WatsonDiscoveryPostProcessingService';
import { WatsonDiscovery } from '../../lib/WatsonDiscovery/WatsonDiscovery';
import { Logger } from '../../class/Logger/Logger';
require('dotenv').config();

const logger: Logger = new Logger();

export class WatsonDiscoveryPostProcessingServiceTest {
  private watsonDiscoveryPostProcessingService = new WatsonDiscoveryPostProcessingService(
    new WatsonDiscovery(new DiscoveryV1({})),
    logger,
  );

  private async getEmptyDiscoveryResults(): Promise<void> {
    it('getEmptyDiscoveryResults', async () => {
      const response = new DiscoveryResponseMock();
      response.result.output.generic.push({
        response_type: 'search_skill', // eslint-disable-line @typescript-eslint/camelcase
        filter: '',
        query: 'somethingYouCannotFind',
        query_type: '', // eslint-disable-line @typescript-eslint/camelcase
      });

      await this.watsonDiscoveryPostProcessingService.processResponse(response);

      return expect(response.result.output.generic.length).toEqual(0);
    });
  }

  private async getNonEmptyDiscoveryResults(): Promise<void> {
    it('getNonEmptyDiscoveryResults', async () => {
      const response = new DiscoveryResponseMock();
      response.result.output.generic.push({
        response_type: 'search_skill', // eslint-disable-line @typescript-eslint/camelcase
        filter: '',
        query: 'bribery',
        query_type: '', // eslint-disable-line @typescript-eslint/camelcase
      });

      await this.watsonDiscoveryPostProcessingService.processResponse(response);
      return expect(response.result.output.generic[0].results.length).not.toEqual(0);
    });
  }

  async test(): Promise<void> {
    this.getEmptyDiscoveryResults();
    this.getNonEmptyDiscoveryResults();
  }
}

new WatsonDiscoveryPostProcessingServiceTest().test();
