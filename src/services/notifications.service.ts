import { BaseService, API_BASE_URL } from './base.service';

export interface NotificationDto {
  id: number;
  type: string;
  typeText: string;
  status: string;
  statusText: string;
  title: string;
  message: string;
  documentId?: number;
  documentName?: string;
  additionalData?: string;
  createdAt: string;
  readAt?: string;
  dismissedAt?: string;
}

export interface NotificationSummaryDto {
  totalCount: number;
  unreadCount: number;
  recentNotifications: NotificationDto[];
}

export interface UpdateNotificationStatusDto {
  status: string;
}

export class NotificationsService extends BaseService {
  private readonly baseUrl = `${API_BASE_URL}/api/notifications`;

  async getNotifications(
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ): Promise<NotificationDto[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<NotificationDto[]>(response);
  }

  async getNotificationSummary(): Promise<NotificationSummaryDto> {
    const response = await fetch(`${this.baseUrl}/summary`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<NotificationSummaryDto>(response);
  }

  async getUnreadCount(): Promise<number> {
    const response = await fetch(`${this.baseUrl}/unread-count`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<number>(response);
  }

  async updateNotificationStatus(
    id: number,
    status: string
  ): Promise<NotificationDto> {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    return this.handleResponse<NotificationDto>(response);
  }

  async markAsRead(id: number): Promise<NotificationDto> {
    return this.updateNotificationStatus(id, 'Read');
  }

  async markAsDismissed(id: number): Promise<NotificationDto> {
    return this.updateNotificationStatus(id, 'Dismissed');
  }

  async markAllAsRead(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/mark-all-read`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<void>(response);
  }

  async deleteNotification(id: number): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<boolean>(response);
  }
}

export const notificationsService = new NotificationsService();