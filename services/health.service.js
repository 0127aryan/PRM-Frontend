import { apiFetch } from '@/lib/api/client';

/** @returns {Promise<{ status: string, api: string, database: string, timestamp: string, service?: string, environment?: string }>} */
export function getHealth() {
  return apiFetch('/health');
}
