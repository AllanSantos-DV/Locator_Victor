import { BaseEntity } from './common';

export enum VehicleCategory {
  STANDARD = 'STANDARD',
  LUXURY = 'LUXURY',
  SUV = 'SUV',
  SPORTS = 'SPORTS'
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE'
}

export interface Vehicle extends BaseEntity {
  brand: string;
  model: string;
  year: number;
  plate: string;
  dailyRate: number;
  available: boolean;
  status: VehicleStatus;
  category: VehicleCategory;
  description?: string;
}

export interface VehicleFormData {
  brand: string;
  model: string;
  year: number;
  plate: string;
  dailyRate: number;
  category: VehicleCategory;
  description?: string;
} 