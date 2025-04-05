import { BaseEntity } from './common';

export enum RentalStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Rental extends BaseEntity {
  customerId: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: RentalStatus;
  
  // Informações adicionais do veículo e cliente
  vehicleBrand?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  customerName?: string;
  
  // Objetos aninhados (serão mantidos para compatibilidade com código existente)
  customer?: {
    id: number;
    name: string;
    email: string;
  };
  vehicle?: {
    id: number;
    brand: string;
    model: string;
    plate: string;
  };
}

export interface RentalFormData {
  customerId: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status?: RentalStatus;
  totalAmount?: number;
} 