import { Role } from '../../../generated/prisma';

export interface ICourier {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  profileImage?: string;
  isAvailable: boolean;
  currentLat?: number;
  currentLng?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}