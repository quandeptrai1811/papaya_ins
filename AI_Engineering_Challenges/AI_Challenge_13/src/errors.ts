export class InsuranceSDKError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsuranceSDKError';
  }
}

export class ValidationError extends InsuranceSDKError {
  public fields: Record<string, string>;
  
  constructor(fields: Record<string, string>) {
    super('Validation Error');
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export class AuthError extends InsuranceSDKError {
  constructor(message: string = 'Authentication Failed') {
    super(message);
    this.name = 'AuthError';
  }
}

export class NetworkError extends InsuranceSDKError {
  constructor(message: string = 'Network Error') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiError extends InsuranceSDKError {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
