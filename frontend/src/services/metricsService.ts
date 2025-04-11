import { api } from './api';

// Interfaces para as métricas
export interface TopCustomerDTO {
  customerId: number;
  customerName: string;
  rentalCount: number;
  totalSpent: number;
}

export interface TopVehicleDTO {
  vehicleId: number;
  vehicleModel: string;
  vehicleBrand: string;
  vehiclePlate: string;
  rentalCount: number;
  totalRevenue: number;
  utilizationRate: number;
}

export interface DiscountDistributionDTO {
  discountRange: string;
  count: number;
  totalAmount: number;
}

export interface RentalMetrics {
  totalRentals: number;
  activeRentals: number;
  completedRentals: number;
  cancelledRentals: number;
  averageDuration: number;
  rentalsByMonth: Record<string, number>;
  rentalsByStatus: Record<string, number>;
  topCustomers: TopCustomerDTO[];
  rentals?: RentalItemDTO[];
  rentalsByMonthAndStatus?: Record<string, Record<string, number>>;
}

export interface VehicleMetrics {
  totalVehicles: number;
  availableVehicles: number;
  unavailableVehicles: number;
  vehiclesByCategory: Record<string, number>;
  vehiclesByStatus: Record<string, number>;
  mostRentedVehicles: TopVehicleDTO[];
  averageUtilizationRate: number;
}

export interface DiscountMetrics {
  totalDiscountsApplied: number;
  totalDiscountAmount: number;
  averageDiscountPercentage: number;
  discountsByType: Record<string, number>;
  discountDistribution: DiscountDistributionDTO[];
}

export interface BusinessMetricsDTO {
  rentalMetrics: RentalMetrics;
  vehicleMetrics: VehicleMetrics;
  discountMetrics: DiscountMetrics;
}

// Nova interface para representar um aluguel individual
export interface RentalItemDTO {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  customerId: number;
  customerName: string;
  vehicleId: number;
  vehicleModel: string;
  totalAmount: number;
}

// Serviço para métricas
export const metricsService = {
  // Obter todas as métricas de negócio
  getBusinessMetrics: async (): Promise<BusinessMetricsDTO> => {
    const response = await api.get('/admin/metrics/business');
    return response.data;
  },

  // Obter métricas de negócio com filtros
  getBusinessMetricsWithFilters: async (params: Record<string, string>): Promise<BusinessMetricsDTO> => {
    const response = await api.get('/admin/metrics/business', { params });
    return response.data;
  },

  // Obter métricas específicas de aluguéis
  getRentalMetrics: async (): Promise<RentalMetrics> => {
    const response = await api.get('/admin/metrics/rentals');
    return response.data;
  },

  // Obter métricas específicas de veículos
  getVehicleMetrics: async (): Promise<VehicleMetrics> => {
    const response = await api.get('/admin/metrics/vehicles');
    return response.data;
  },

  // Obter métricas específicas de descontos
  getDiscountMetrics: async (): Promise<DiscountMetrics> => {
    const response = await api.get('/admin/metrics/discounts');
    return response.data;
  }
}; 