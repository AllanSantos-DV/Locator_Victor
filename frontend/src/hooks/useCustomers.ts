import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customerService';
import { CustomerFormData } from '../types/customer';

export const useCustomers = () => {
  const queryClient = useQueryClient();

  const customers = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.findAll
  });

  const useCustomerById = (id: number) => useQuery({
    queryKey: ['customers', id],
    queryFn: () => customerService.findById(id.toString())
  });

  const useCustomerByEmail = (email: string) => useQuery({
    queryKey: ['customers', 'email', email],
    queryFn: () => customerService.findByEmail(email),
    enabled: !!email
  });

  const useCustomerByDocument = (document: string) => useQuery({
    queryKey: ['customers', 'document', document],
    queryFn: () => customerService.findByDocument(document),
    enabled: !!document
  });

  const useCustomerHasActiveRentals = (customerId: number) => useQuery({
    queryKey: ['customers', customerId, 'active-rentals'],
    queryFn: () => customerService.hasActiveRentals(customerId.toString()),
    enabled: !!customerId
  });

  const createCustomer = useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });

  const updateCustomer = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerFormData }) =>
      customerService.update(id.toString(), data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
    }
  });

  const deleteCustomer = useMutation({
    mutationFn: (id: number) => customerService.delete(id.toString()),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
    }
  });

  return {
    customers,
    useCustomerById,
    useCustomerByEmail,
    useCustomerByDocument,
    useCustomerHasActiveRentals,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
}; 