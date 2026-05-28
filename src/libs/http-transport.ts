import { isRecord } from '../lib/core/guards';
import {
  type HttpTransport,
  HttpTransportError,
  type HttpTransportRequest,
} from '../lib/core/http-transport';
import type { HttpMethod } from '../lib/core/types';

const METHODS_WITH_BODY: HttpMethod[] = ['post', 'put', 'patch'];

function getViteEnvString(name: 'VITE_API_BASE_URL'): string {
  const env: unknown = import.meta.env;
  if (!isRecord(env)) {
    throw new Error('import.meta.env is not available');
  }

  const value: unknown = env[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${name} must be a non-empty string`);
  }

  return value;
}

function getBaseUrl(): string {
  return getViteEnvString('VITE_API_BASE_URL');
}

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

/**
 * Exemplo de implementação do contrato {@link HttpTransport} com `fetch`.
 * Troque ou adapte este arquivo (axios, ky, etc.) conforme o seu app.
 */
export const appHttpTransport: HttpTransport = {
  async request(req: HttpTransportRequest) {
    const url = buildUrl(getBaseUrl(), req.url, req.queryParams);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
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
