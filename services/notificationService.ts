import { api } from './api';

export interface Notification {
  _id: string;
  userId: string;
  type: 'appointment_confirmed' | 'payment_due' | 'property_match' | 'service_completed' | 'contract_expiring' | 'message_received';
  title: string;
  message: string;
  icon: string;
  isRead: boolean;
  relatedEntity?: {
    type: string;
    id: string;
  };
  actionUrl?: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const notificationService = {
  // Get all notifications
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Get unread notifications
  getUnread: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async (): Promise<{ message: string; modifiedCount: number }> => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};
