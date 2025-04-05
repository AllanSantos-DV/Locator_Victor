import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rentalService } from '../services/rentalService';
import { RentalFormData, RentalStatus } from '../types/rental';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
    }
  });

  const updateRental = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RentalFormData }) =>
      rentalService.update(id.toString(), data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['rentals', id] });
    }
  });

  const startRental = useMutation({
    mutationFn: rentalService.startRental,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['rentals', id] });
    }
  });

  const completeRental = useMutation({
    mutationFn: rentalService.completeRental,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['rentals', id] });
    }
  });

  const cancelRental = useMutation({
    mutationFn: (id: string) => rentalService.cancelRental(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['rentals', id] });
    }
  });

  const deleteRental = useMutation({
    mutationFn: (id: string) => rentalService.delete(id),
    onSuccess: (_, id) => {
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
    deleteRental
  };
}; 