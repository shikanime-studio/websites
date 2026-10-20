import type { CommissionStatus } from "../schema";

export interface Commission {
  id: number;
  title: string;
  description: string;
  status: CommissionStatus;
  photographerId: string;
  clientId: string;
  characterName: string;
  shootingDate: string | null;
  locationName: string;
  locationQuery: string;
  deliveryReadyAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface PhotoListItem {
  id: number;
  contentType: string;
  size: number;
  createdAt: number;
}
