import { getApiUrl, API_BASE_URL } from '../config/api';

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  isHtmlFallback?: boolean;
}

export class ApiError extends Error {
  status: number;
  isHtmlFallback: boolean;

  constructor(message: string, status: number = 0, isHtmlFallback: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isHtmlFallback = isHtmlFallback;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { timeoutMs = 15000, skipAuth = false, headers: customHeaders, ...restOptions } = options;
  const url = getApiUrl(endpoint);

  if (process.env.NODE_ENV !== 'test') {
    console.log(`[API Request] API_BASE_URL = "${API_BASE_URL}"`);
    console.log(`[API Request] Request URL = "${url}"`);
  }

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuth && typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('alkaswa_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Set default Content-Type for POST/PUT if body is provided and not already specified
  if (restOptions.body && typeof restOptions.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timer);

    const contentType = response.headers.get('content-type') || '';
    const isHtml = contentType.includes('text/html');

    if (isHtml) {
      return {
        ok: false,
        status: response.status,
        error: 'Backend API endpoint is unavailable on this static hosting. Please configure VITE_API_BASE_URL to point to a live backend deployment.',
        isHtmlFallback: true,
      };
    }

    let data: any = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        if (!response.ok) {
          return {
            ok: false,
            status: response.status,
            error: `API returned non-JSON response (${response.status}). Check backend configuration.`,
          };
        }
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data,
        error: data?.error || data?.message || `HTTP Request failed with status ${response.status}`,
      };
    }

    return {
      ok: true,
      status: response.status,
      data,
    };
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return {
        ok: false,
        status: 408,
        error: 'API request timed out after 15 seconds. Please check backend network connectivity.',
      };
    }

    return {
      ok: false,
      status: 0,
      error: 'Backend API is unreachable. If deployed on static hosting (e.g. Netlify), ensure VITE_API_BASE_URL is configured in environment settings.',
    };
  }
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  request: apiRequest,
};
