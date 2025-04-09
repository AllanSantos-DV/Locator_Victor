import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rentalService } from '../services/rentalService';
import { RentalFormData, RentalStatus, Rental } from '../types/rental';

export const useRentals = () => {
  const queryClient = useQueryClient();

  const rentals = useQuery({
    queryKey: ['rentals'],
    queryFn: rentalService.findAll
  });

  const useRentalById = (id: number) => {
    return useQuery({
      queryKey: ['rentals', id],
      queryFn: () => rentalService.findById(id.toString()),
      enabled: !!id
    });
  };

  const useRentalsByCustomer = (customerId: number) => {
    return useQuery({
      queryKey: ['rentals', 'customer', customerId],
      queryFn: () => rentalService.findByCustomerId(customerId.toString()),
      enabled: !!customerId
    });
  };

  const useRentalsByVehicle = (vehicleId: number) => {
    return useQuery({
      queryKey: ['rentals', 'vehicle', vehicleId],
      queryFn: () => rentalService.findByVehicleId(vehicleId.toString()),
      enabled: !!vehicleId
    });
  };

  const useRentalsByStatus = (status: RentalStatus) => {
    return useQuery({
      queryKey: ['rentals', 'status', status],
      queryFn: () => rentalService.findByStatus(status),
      enabled: !!status
    });
  };

  const useRentalsByPeriod = (start: string, end: string) => {
    return useQuery({
      queryKey: ['rentals', 'period', start, end],
      queryFn: () => rentalService.findByPeriod(new Date(start), new Date(end)),
      enabled: !!start && !!end
    });
  };

  const createRental = useMutation({
    mutationFn: rentalService.create,
    onSuccess: (_, variables) => {
      // Invalida queries de veículos de forma mais abrangente
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', variables.vehicleId] });
      
      // Força a invalidação de qualquer query relacionada a veículos
      queryClient.refetchQueries({ queryKey: ['vehicles'], type: 'all' });
      
      // Invalida queries de aluguéis
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['rentals', 'vehicle', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['rentals', 'customer', variables.customerId] });
    }
  });

  const updateRental = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RentalFormData }) =>
      rentalService.update(id.toString(), data),
    onSuccess: (_, { id, data }) => {
      // Invalida todas as queries relacionadas a veículos
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', data.vehicleId] });
      
      // Força a invalidação de qualquer query relacionada a veículos
      queryClient.refetchQueries({ queryKey: ['vehicles'], type: 'all' });
      
      // Invalida queries de aluguéis
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['rentals', id] });
      queryClient.invalidateQueries({ queryKey: ['rentals', 'vehicle', data.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['rentals', 'customer', data.customerId] });
    }
  });

  const startRental = useMutation({
    mutationFn: (id: string) => rentalService.startRental(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      // Força a invalidação de qualquer query relacionada a veículos
      queryClient.refetchQueries({ queryKey: ['vehicles'], type: 'all' });
    },
  });

  const completeRental = useMutation({
    mutationFn: (id: string) => rentalService.completeRental(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      // Força a invalidação de qualquer query relacionada a veículos
      queryClient.refetchQueries({ queryKey: ['vehicles'], type: 'all' });
    },
  });

  const cancelRental = useMutation({
    mutationFn: (id: string) => rentalService.cancelRental(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      // Força a invalidação de qualquer query relacionada a veículos
      queryClient.refetchQueries({ queryKey: ['vehicles'], type: 'all' });
    },
  });

  const terminateRentalEarly = useMutation({
    mutationFn: (id: string) => rentalService.terminateRentalEarly(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      // Força a invalidação de qualquer query relacionada a veículos
      queryClient.refetchQueries({ queryKey: ['vehicles'], type: 'all' });
    },
  });

  const extendRental = useMutation({
    mutationFn: ({ id, newEndDate }: { id: string; newEndDate: Date }) => 
      rentalService.extendRental(id, newEndDate),
    onSuccess: (_, { id }) => {
      // Invalida queries de aluguéis
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['rentals', id] });
    }
  });

  const deleteRental = useMutation({
    mutationFn: (id: string) => rentalService.delete(id),
    onSuccess: (_, id) => {
      // Invalida todas as queries relacionadas a veículos
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'available'] });
      
      // Invalida queries de aluguéis
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['rentals', id] });
    }
  });

  return {
    rentals,
    useRentalById,
    useRentalsByCustomer,
    useRentalsByVehicle,
    useRentalsByStatus,
    useRentalsByPeriod,
    createRental,
    updateRental,
    startRental,
    completeRental,
    cancelRental,
    terminateRentalEarly,
    extendRental,
    deleteRental
  };
}; 