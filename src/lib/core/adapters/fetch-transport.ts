import {
  type HttpTransport,
  HttpTransportError,
  type HttpTransportRequest,
} from '../http-transport';
import type { HttpMethod } from '../types';

export type FetchTransportConfig = {
  baseURL: string;
  defaultHeaders?: Record<string, string>;
};

const METHODS_WITH_BODY: HttpMethod[] = ['post', 'put', 'patch'];

function stringifyQueryValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  return JSON.stringify(value);
}

function buildUrl(
  baseURL: string,
  path: string,
  queryParams?: Record<string, unknown>,
): string {
  const base = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, stringifyQueryValue(value));
      }
    }
  }

  return url.toString();
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(text);
    return parsed;
  } catch {
    return text;
  }
}

export function createFetchTransport(
  config: FetchTransportConfig,
): HttpTransport {
  const defaultHeaders = config.defaultHeaders ?? {};

  return {
    async request(req: HttpTransportRequest) {
      const url = buildUrl(config.baseURL, req.url, req.queryParams);
      const headers: Record<string, string> = {
        ...defaultHeaders,
        ...req.headers,
      };

      const hasBody =
        METHODS_WITH_BODY.includes(req.method) && req.body !== undefined;

      if (hasBody && !headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
      }

      const init: RequestInit = {
        method: req.method.toUpperCase(),
        headers,
        body: hasBody ? JSON.stringify(req.body) : undefined,
      };

      let response: Response;

      try {
        response = await fetch(url, init);
      } catch (error: unknown) {
        throw new HttpTransportError({
          message:
            error instanceof Error ? error.message : 'Network request failed',
          raw: error,
        });
      }

      const data = await parseJsonBody(response);

      if (!response.ok) {
        throw new HttpTransportError({
          status: response.status,
          data,
          message: response.statusText,
          raw: response,
        });
      }

      return { data, status: response.status };
    },
  };
}
