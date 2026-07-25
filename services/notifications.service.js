import { apiFetch } from '@/lib/api/client';

export function listNotifications() {
  return apiFetch('/notifications');
}

export function markNotificationRead(id) {
  return apiFetch(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsRead() {
  return apiFetch('/notifications/read-all', {
    method: 'PATCH',
  });
}
