import { api } from './api';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  type?: string;
  referenceId?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

const notificationService = {
  // Obter todas as notificações do usuário com paginação
  getUserNotifications: async (page = 0, size = 10): Promise<PageResponse<Notification>> => {
    const response = await api.get<PageResponse<Notification>>(`/api/notifications`, {
      params: { page, size }
    });
    return response.data;
  },

  // Obter notificações não lidas
  getUnreadNotifications: async (page = 0, size = 10): Promise<PageResponse<Notification>> => {
    const response = await api.get<PageResponse<Notification>>(`/api/notifications/unread`, {
      params: { page, size }
    });
    return response.data;
  },

  // Obter contagem de notificações não lidas
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<number>(`/api/notifications/unread-count`);
    return response.data;
  },

  // Marcar uma notificação como lida
  markAsRead: async (notificationId: number): Promise<void> => {
    await api.patch(`/api/notifications/${notificationId}/read`);
  },

  // Marcar todas as notificações como lidas
  markAllAsRead: async (): Promise<void> => {
    await api.patch(`/api/notifications/read-all`);
  },

  // Excluir uma notificação
  deleteNotification: async (notificationId: number): Promise<void> => {
    await api.delete(`/api/notifications/${notificationId}`);
  }
};

export { notificationService }; 