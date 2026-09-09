import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '../app/config/env';
import type { ApiError } from '../types';

export const ADMIN_TOKEN_STORAGE_KEY = 'kc_admin_token';

interface ErrorPayload {
  message?: string;
  code?: string;
  fieldErrors?: Record<string, string>;
}

const attachHeaders = (config: InternalAxiosRequestConfig) => {
  if (!config.headers.has('X-Request-ID')) {
    config.headers.set('X-Request-ID', crypto.randomUUID());
  }

  // Only attach JWT token to our backend API endpoints
  const isInternalApi =
    !config.url ||
    config.url.startsWith('/') ||
    config.url.startsWith(env.apiBaseUrl);

  if (isInternalApi && typeof window !== 'undefined') {
    try {
      const token = sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
      if (token && !config.headers.has('Authorization')) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    } catch {
      // sessionStorage unavailable
    }
  }

  // If sending FormData, delete Content-Type to let the browser set multipart/form-data with boundary
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }

  return config;
};

export const normalizeApiError = (error: unknown): ApiError => {
  if (!axios.isAxiosError<ErrorPayload>(error)) {
    return { status: 0, message: error instanceof Error ? error.message : 'Something went wrong.' };
  }

  const requestId =
    error.response?.headers['x-request-id'] ?? error.config?.headers?.get?.('X-Request-ID');

  return {
    status: error.response?.status ?? 0,
    message:
      error.response?.data?.message ??
      (error.code === AxiosError.ETIMEDOUT
        ? 'The request took too long. Please try again.'
        : 'We could not complete your request.'),
    code: error.response?.data?.code ?? error.code,
    requestId: typeof requestId === 'string' ? requestId : undefined,
    fieldErrors: error.response?.data?.fieldErrors,
  };
};

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(attachHeaders);
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = normalizeApiError(error);

    // If unauthorized (401), clean up session
    if (apiError.status === 401 && typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      } catch {
        // ignore
      }

      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('kc:auth:unauthorized'));
      }
    }

    return Promise.reject(apiError);
  },
);
