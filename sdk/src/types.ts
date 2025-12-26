export interface ResQClientOptions {
  baseUrl: string;
  token?: string;
  apiKey?: string;
  timeoutMs?: number;
}

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, string | number | boolean>;
  body?: any;
  headers?: Record<string, string>;
}

export interface ResQErrorDetails {
  status: number;
  message: string;
  details?: any;
  requestId?: string;
}

export class ResQError extends Error implements ResQErrorDetails {
  status: number;
  details?: any;
  requestId?: string;

  constructor(data: ResQErrorDetails) {
    super(data.message);
    this.name = "ResQError";
    this.status = data.status;
    this.details = data.details;
    this.requestId = data.requestId;

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResQError);
    }
  }
}
