import { vehicleService } from '../../services/vehicleService';
import { Vehicle, VehicleCategory } from '../../types/vehicle';
import { ApiResponse } from '../../types/common';
import { api } from '../../services/api';

jest.mock('../../services/api');

describe('vehicleService', () => {
  const mockVehicle: Vehicle = {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    plate: 'ABC1234',
    color: 'Black',
    category: VehicleCategory.STANDARD,
    dailyRate: 100,
    available: true,
    createdAt: '2024-02-20T00:00:00.000Z',
    updatedAt: '2024-02-20T00:00:00.000Z'
  };

  const mockResponse: ApiResponse<Vehicle[]> = {
    data: [mockVehicle],
    message: 'Success'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all vehicles', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await vehicleService.findAll();

      expect(result).toEqual(mockResponse);
      expect(api.get).toHaveBeenCalledWith('/vehicles');
    });
  });

  describe('findById', () => {
    it('should return a vehicle by id', async () => {
      const mockSingleResponse: ApiResponse<Vehicle> = {
        data: mockVehicle,
        message: 'Success'
      };

      (api.get as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const result = await vehicleService.findById('1');

      expect(result).toEqual(mockSingleResponse);
      expect(api.get).toHaveBeenCalledWith('/vehicles/1');
    });
  });

  describe('findByPlate', () => {
    it('should return a vehicle by plate', async () => {
      const mockSingleResponse: ApiResponse<Vehicle> = {
        data: mockVehicle,
        message: 'Success'
      };

      (api.get as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const result = await vehicleService.findByPlate('ABC1234');

      expect(result).toEqual(mockSingleResponse);
      expect(api.get).toHaveBeenCalledWith('/vehicles/plate/ABC1234');
    });
  });

  describe('findAvailable', () => {
    it('should return available vehicles', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await vehicleService.findAvailable();

      expect(result).toEqual(mockResponse);
      expect(api.get).toHaveBeenCalledWith('/vehicles/available');
    });
  });

  describe('findByCategory', () => {
    it('should return vehicles by category', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await vehicleService.findByCategory(VehicleCategory.STANDARD);

      expect(result).toEqual(mockResponse);
      expect(api.get).toHaveBeenCalledWith('/vehicles/category/STANDARD');
    });
  });

  describe('create', () => {
    it('should create a new vehicle', async () => {
      const mockSingleResponse: ApiResponse<Vehicle> = {
        data: mockVehicle,
        message: 'Success'
      };

      (api.post as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const result = await vehicleService.create({
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        plate: 'ABC1234',
        color: 'Black',
        category: VehicleCategory.STANDARD,
        dailyRate: 100
      });

      expect(result).toEqual(mockSingleResponse);
      expect(api.post).toHaveBeenCalledWith('/vehicles', {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        plate: 'ABC1234',
        color: 'Black',
        category: VehicleCategory.STANDARD,
        dailyRate: 100
      });
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      const mockSingleResponse: ApiResponse<Vehicle> = {
        data: mockVehicle,
        message: 'Success'
      };

      (api.put as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const result = await vehicleService.update('1', {
        dailyRate: 120
      });

      expect(result).toEqual(mockSingleResponse);
      expect(api.put).toHaveBeenCalledWith('/vehicles/1', {
        dailyRate: 120
      });
    });
  });

  describe('updateAvailability', () => {
    it('should update vehicle availability', async () => {
      const mockSingleResponse: ApiResponse<Vehicle> = {
        data: { ...mockVehicle, available: false },
        message: 'Success'
      };

      (api.patch as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const result = await vehicleService.updateAvailability('1', false);

      expect(result).toEqual(mockSingleResponse);
      expect(api.patch).toHaveBeenCalledWith('/vehicles/1/availability', { available: false });
    });
  });
}); 