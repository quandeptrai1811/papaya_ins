import { ApiClient } from '../client';
import { UploadDocumentParams, Document } from '../types';
import FormData from 'form-data';
import { ValidationError } from '../errors';
import fs from 'fs';

export class DocumentsResource {
  private api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  /**
   * Uploads a document to a specific claim.
   * Note: In a Node.js environment, `file` should be a ReadStream (e.g., fs.createReadStream('path')).
   * In a browser environment, it should be a File or Blob.
   */
  public async upload(claimId: string, file: any, params: UploadDocumentParams): Promise<Document> {
    if (!claimId) throw new ValidationError({ claimId: 'Required' });
    if (!file) throw new ValidationError({ file: 'Required' });
    if (!params.type) throw new ValidationError({ type: 'Required' });

    const formData = new FormData();
    formData.append('type', params.type);
    formData.append('file', file);

    const config: any = {
      headers: {
        ...(typeof formData.getHeaders === 'function' ? formData.getHeaders() : {}),
      },
    };

    if (params.onProgress) {
      config.onUploadProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          params.onProgress!(percentCompleted);
        }
      };
    }

    const response = await this.api.client.post(`/api/v1/claims/${claimId}/documents`, formData, config);
    return response.data;
  }

  public async list(claimId: string): Promise<Document[]> {
    if (!claimId) throw new ValidationError({ claimId: 'Required' });
    const response = await this.api.client.get(`/api/v1/claims/${claimId}/documents`);
    return response.data;
  }
}
