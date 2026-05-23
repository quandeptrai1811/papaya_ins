import { ApiClient } from './client';
import { SDKOptions } from './types';
import { ClaimsResource } from './resources/claims';
import { DocumentsResource } from './resources/documents';

export class InsuranceSDK {
  private api: ApiClient;
  public claims: ClaimsResource;
  public documents: DocumentsResource;

  constructor(options: SDKOptions) {
    if (!options.apiKey) {
      throw new Error('apiKey is required to initialize InsuranceSDK');
    }

    this.api = new ApiClient(options);
    this.claims = new ClaimsResource(this.api);
    this.documents = new DocumentsResource(this.api);
  }
}

export * from './types';
export * from './errors';
