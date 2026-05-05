export class NetworkError extends Error {
  constructor(message = 'No internet connection') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'City not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ApiError extends Error {
  constructor(
    message = 'Something went wrong',
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type AppError = NetworkError | NotFoundError | RateLimitError | ApiError;
