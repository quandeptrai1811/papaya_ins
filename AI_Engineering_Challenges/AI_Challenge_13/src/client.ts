import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { SDKOptions } from './types';
import { AuthError, NetworkError, ApiError, ValidationError } from './errors';

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export class ApiClient {
  public client: AxiosInstance;
  private token: string | null = null;
  private options: SDKOptions;

  constructor(options: SDKOptions) {
    this.options = options;
    const baseURL = options.baseUrl || (options.environment === 'sandbox' ? 'http://localhost:3000' : 'https://api.insurance.example.com');
    
    this.client = axios.create({
      baseURL,
      timeout: options.timeout || 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(async (config) => {
      if (!this.token && config.url !== '/api/v1/auth/token') {
        await this.authenticate();
      }
      
      if (this.token && config.url !== '/api/v1/auth/token') {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: any) => {
        if (error.name && error.name.endsWith('Error') && !error.isAxiosError && !error.config) {
          return Promise.reject(error);
        }
        
        const config = error.config as CustomRequestConfig;
        if (!config) return Promise.reject(error);

        // 1. Handle Validation Errors (400)
        if (error.response?.status === 400 && error.response.data && (error.response.data as any).fields) {
           return Promise.reject(new ValidationError((error.response.data as any).fields));
        }

        // 2. Handle Authentication Errors (401)
        if (error.response?.status === 401 && !config._retry) {
          config._retry = true;
          this.token = null; // Clear bad token
          try {
            await this.authenticate();
            if (this.token && config.headers) {
              config.headers.Authorization = `Bearer ${this.token}`;
            }
            return this.client(config);
          } catch (authErr) {
            return Promise.reject(new AuthError('Authentication failed. Please check your API key.'));
          }
        }

        // 3. Handle Transient Failures (503 or Network Error)
        if ((error.response?.status === 503 || !error.response) && !config._retry) {
          // Implement simple retry with exponential backoff
          const retries = (config as any)._retries || 0;
          if (retries < 3) {
            (config as any)._retries = retries + 1;
            const backoff = Math.pow(2, retries) * 1000;
            
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(this.client(config));
              }, backoff);
            });
          }
        }

        // 4. Map generic errors
        if (!error.response) {
          return Promise.reject(new NetworkError(error.message));
        }

        return Promise.reject(new ApiError(error.response.status, (error.response.data as any)?.error || error.message));
      }
    );
  }

  private async authenticate() {
    try {
      const response = await this.client.post('/api/v1/auth/token', {
        apiKey: this.options.apiKey
      }, { timeout: this.options.timeout });
      
      this.token = response.data.token;
    } catch (error: any) {
      if (error.status === 400 || error.response?.status === 400) {
         throw new AuthError('Invalid API Key');
      }
      throw error;
    }
  }
}
