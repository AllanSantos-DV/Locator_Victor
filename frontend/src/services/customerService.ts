import { api } from './api';
import { Customer, CustomerFormData } from '../types/customer';
import { ApiResponse } from '../types/common';

export const customerService = {
  findAll: async (): Promise<ApiResponse<Customer[]>> => {
    return api.get('/customers');
  },

  findById: async (id: string): Promise<ApiResponse<Customer>> => {
    return api.get(`/customers/${id}`);
  },

  findByEmail: async (email: string): Promise<ApiResponse<Customer>> => {
    return api.get(`/customers/email/${email}`);
  },

  findByDocument: async (document: string): Promise<ApiResponse<Customer>> => {
    return api.get(`/customers/document/${document}`);
  },

  hasActiveRentals: async (id: string): Promise<ApiResponse<boolean>> => {
    return api.get(`/customers/${id}/active-rentals`);
  },

  create: async (data: CustomerFormData): Promise<ApiResponse<Customer>> => {
    return api.post('/customers', data);
  },

  update: async (id: string, data: Partial<CustomerFormData>): Promise<ApiResponse<Customer>> => {
    return api.put(`/customers/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/customers/${id}`);
  }
}; 