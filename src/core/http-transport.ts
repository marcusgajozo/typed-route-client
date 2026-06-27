import type { HttpMethod } from './types';

export type HttpTransportRequest<TContext = undefined> = {
  method: HttpMethod;
  url: string;
  body?: unknown;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
  context?: TContext;
};

export type HttpTransportResponse = {
  data: unknown;
  status: number;
};

export class HttpTransportError extends Error {
  readonly status?: number;
  readonly data?: unknown;
  readonly raw: unknown;

  constructor(options: {
    message?: string;
    status?: number;
    data?: unknown;
    raw: unknown;
  }) {
    super(options.message ?? 'HTTP request failed');
    this.name = 'HttpTransportError';
    this.status = options.status;
    this.data = options.data;
    this.raw = options.raw;
  }
}

export type HttpTransport<TContext = undefined> = {
  request(req: HttpTransportRequest<TContext>): Promise<HttpTransportResponse>;
};
