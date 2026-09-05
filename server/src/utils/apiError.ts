/** Application error with an HTTP status and a machine-readable code. */

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }

  static badRequest(code: string, message: string): ApiError {
    return new ApiError(400, code, message);
  }
  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }
  static forbidden(message = 'Not allowed'): ApiError {
    return new ApiError(403, 'FORBIDDEN', message);
  }
  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, 'NOT_FOUND', message);
  }
  static tooMany(message = 'Too many requests'): ApiError {
    return new ApiError(429, 'RATE_LIMITED', message);
  }
}
