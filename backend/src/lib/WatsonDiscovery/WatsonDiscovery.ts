import AssistantV1, { Response } from 'ibm-watson/assistant/v1';
import DiscoveryV1 from 'ibm-watson/discovery/v1';

export class WatsonDiscovery {
  constructor(private discovery: DiscoveryV1) {}

  public getQueryResults(
    query: string,
    filter: string,
    count: number,
  ): Promise<AssistantV1.Response<DiscoveryV1.QueryResponse>> {
    return this.discovery.query({
      environmentId: process.env.discovery_environment_id,
      collectionId: process.env.discovery_collection_id,
      query,
      filter,
      count,
      highlight: true,
      passagesCount: 200,
      deduplicate: true,
      deduplicateField: 'text',
    });
  }
}
