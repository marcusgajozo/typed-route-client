import { createFetchTransport } from '../lib/core/adapters/fetch-transport';
import { isRecord } from '../lib/core/guards';

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

export const fetchConfig = createFetchTransport({
  baseURL: getBaseUrl(),
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
});
