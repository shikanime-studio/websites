import type { CommissionRole, CommissionStatus, Locale } from "../schema";

export type { CommissionRole, CommissionStatus, Locale };

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

export interface CharacterRef {
  id: number;
  name: string;
  series: string | null;
}

export interface CastMember {
  id: number;
  role: CommissionRole;
  name: string;
}

export interface InviteLink {
  id: number;
  commissionId: number;
  token: string;
  role: CommissionRole;
  label: string;
  expiresAt: Date | null;
  revokedAt: Date | null;
  createdBy: string;
  createdAt: Date;
}

export interface CommissionDetail extends Commission {
  photos: Array<PhotoListItem>;
  attendees: Array<{ id: number; name: string; email: string }>;
  characters: Array<CharacterRef>;
  cast: Array<CastMember>;
  invites: Array<InviteLink>;
}

export interface PublicProfile {
  name: string;
  image: string | null;
  slug: string;
  headline: string;
  bio: string;
  location: string;
  instagram: string;
  links: Array<{ label: string; url: string }>;
  acceptRequests: boolean;
  plans: Array<{
    id: number;
    title: string;
    characterName: string;
    shootingDate: string | null;
    timezone: string;
    locationName: string;
    status: string;
  }>;
  past: Array<{
    id: number;
    title: string;
    characterName: string;
    shootingDate: string | null;
    locationName: string;
    photoCount: number;
  }>;
}
