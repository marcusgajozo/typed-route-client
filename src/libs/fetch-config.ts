import type { FetchTransportConfig } from '../lib/core/adapters/fetch-transport';

function getBaseUrl(): string {
  const baseURL = import.meta.env.VITE_BASE_URL;
  if (typeof baseURL !== 'string' || baseURL.length === 0) {
    throw new Error('VITE_BASE_URL must be a non-empty string');
  }
  return baseURL;
}

export const fetchConfig = {
  baseURL: getBaseUrl(),
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
} satisfies FetchTransportConfig;
