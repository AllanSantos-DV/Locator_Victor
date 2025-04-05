import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '../services/vehicleService';
import { VehicleCategory, VehicleFormData } from '../types/vehicle';

export const useVehicles = () => {
  const queryClient = useQueryClient();

  const vehicles = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleService.findAll
  });

  const availableVehicles = useQuery({
    queryKey: ['vehicles', 'available'],
    queryFn: vehicleService.findAvailable
  });

  const useVehicleById = (id: number) => useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => vehicleService.findById(id.toString())
  });

  const useVehiclesByCategory = (category: VehicleCategory) => useQuery({
    queryKey: ['vehicles', 'category', category],
    queryFn: () => vehicleService.findByCategory(category)
  });

  const createVehicle = useMutation({
    mutationFn: vehicleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    }
  });

  const updateVehicle = useMutation({
    mutationFn: ({ id, data }: { id: number; data: VehicleFormData }) =>
      vehicleService.update(id.toString(), data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', id] });
    }
  });

  const deleteVehicle = useMutation({
    mutationFn: (id: number) => vehicleService.delete(id.toString()),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', id] });
    }
  });

  const updateVehicleAvailability = useMutation({
    mutationFn: ({ id, available }: { id: number; available: boolean }) =>
      vehicleService.updateAvailability(id.toString(), available),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'available'] });
    }
  });

  return {
    vehicles,
    availableVehicles,
    useVehicleById,
    useVehiclesByCategory,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    updateVehicleAvailability
  };
}; 