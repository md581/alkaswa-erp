// Centralized API Configuration for Al Kaswa ERP
export const API_BASE_URL = (((import.meta as any).env?.VITE_API_BASE_URL) || '').replace(/\/+$/, '');

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}
