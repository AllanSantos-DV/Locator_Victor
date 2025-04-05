import { api } from './api';
import { Rental, RentalFormData, RentalStatus } from '../types/rental';
import { ApiResponse } from '../types/common';

export const rentalService = {
  findAll: async (): Promise<ApiResponse<Rental[]>> => {
    return api.get('/rentals');
  },

  findById: async (id: string): Promise<ApiResponse<Rental>> => {
    return api.get(`/rentals/${id}`);
  },

  findByCustomerId: async (customerId: string): Promise<ApiResponse<Rental[]>> => {
    return api.get(`/rentals/customer/${customerId}`);
  },

  findByVehicleId: async (vehicleId: string): Promise<ApiResponse<Rental[]>> => {
    return api.get(`/rentals/vehicle/${vehicleId}`);
  },

  findByStatus: async (status: RentalStatus): Promise<ApiResponse<Rental[]>> => {
    return api.get(`/rentals/status/${status}`);
  },

  findByPeriod: async (startDate: Date, endDate: Date): Promise<ApiResponse<Rental[]>> => {
    return api.get('/rentals/period', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  },

  create: async (data: RentalFormData): Promise<ApiResponse<Rental>> => {
    return api.post('/rentals', data);
  },

  update: async (id: string, data: Partial<RentalFormData>): Promise<ApiResponse<Rental>> => {
    return api.put(`/rentals/${id}`, data);
  },

  startRental: async (id: string): Promise<ApiResponse<Rental>> => {
    return api.patch(`/rentals/${id}/start`);
  },

  completeRental: async (id: string): Promise<ApiResponse<Rental>> => {
    return api.patch(`/rentals/${id}/complete`);
  },

  cancelRental: async (id: string, reason?: string): Promise<ApiResponse<Rental>> => {
    return api.patch(`/rentals/${id}/cancel`, reason ? { reason } : {});
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/rentals/${id}`);
  },
};
