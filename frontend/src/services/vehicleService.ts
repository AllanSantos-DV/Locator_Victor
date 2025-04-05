import { api } from './api';
import { Vehicle, VehicleFormData, VehicleCategory } from '../types/vehicle';
import { ApiResponse } from '../types/common';

export const vehicleService = {
  findAll: async (): Promise<ApiResponse<Vehicle[]>> => {
    return api.get('/vehicles');
  },

  findById: async (id: string): Promise<ApiResponse<Vehicle>> => {
    return api.get(`/vehicles/${id}`);
  },

  findByPlate: async (plate: string): Promise<ApiResponse<Vehicle>> => {
    return api.get(`/vehicles/plate/${plate}`);
  },

  findAvailable: async (): Promise<ApiResponse<Vehicle[]>> => {
    return api.get('/vehicles/available');
  },

  findByCategory: async (category: VehicleCategory): Promise<ApiResponse<Vehicle[]>> => {
    return api.get(`/vehicles/category/${category}`);
  },

  create: async (data: VehicleFormData): Promise<ApiResponse<Vehicle>> => {
    return api.post('/vehicles', data);
  },

  update: async (id: string, data: Partial<VehicleFormData>): Promise<ApiResponse<Vehicle>> => {
    return api.put(`/vehicles/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/vehicles/${id}`);
  },

  updateAvailability: async (id: string, available: boolean): Promise<ApiResponse<Vehicle>> => {
    return api.patch(`/vehicles/${id}/availability`, { available });
  },
}; 