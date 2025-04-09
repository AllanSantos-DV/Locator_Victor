import { BaseEntity } from './common';

export enum RentalStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EARLY_TERMINATED = 'EARLY_TERMINATED'
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
  vehicleDailyRate?: number;
  customerName?: string;
  notes?: string;
  
  // Campos de encerramento antecipado
  earlyTerminationFee?: number;
  originalTotalAmount?: number;
  endedEarly?: boolean;
  
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
    dailyRate?: number;
  };
}

export interface RentalFormData {
  customerId: string | number;
  vehicleId: string | number;
  vehicleDailyRate: number;
  vehiclePlate?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  notes?: string;
  status?: RentalStatus;
}