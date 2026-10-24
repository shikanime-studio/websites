import type { CommissionStatus, Locale } from "../schema";

export type { CommissionStatus, Locale };

export interface NotificationItem {
  id: number;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedId: number | null;
  relatedType: string | null;
  isRead: boolean | null;
  createdAt: Date;
}

export type NotificationList = Array<NotificationItem>;

export interface Commission {
  id: number;
  title: string;
  description: string;
  status: CommissionStatus;
  photographerId: string;
  clientId: string;
  characterName: string;
  shootingDate: string | null;
  timezone: string;
  shareToken: string;
  invitees: string;
  locationName: string;
  locationQuery: string;
  deliveryReadyAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CommissionList = Array<Commission>;

export interface PhotoListItem {
  id: number;
  contentType: string;
  size: number;
  createdAt: Date;
}

export interface CommissionDetail extends Commission {
  photos: Array<PhotoListItem>;
}
