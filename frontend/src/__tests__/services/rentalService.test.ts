import { rentalService } from '../../services/rentalService';
import { Rental, RentalStatus } from '../../types/rental';
import { ApiResponse } from '../../types/common';
import { api } from '../../services/api';

jest.mock('../../services/api');

describe('rentalService', () => {
  const mockRental: Rental = {
    id: 1,
    customerId: 1,
    vehicleId: 1,
    startDate: '2024-02-20T00:00:00.000Z',
    endDate: '2024-02-27T00:00:00.000Z',
    totalAmount: 1000,
    status: RentalStatus.PENDING,
    createdAt: '2024-02-20T00:00:00.000Z',
    updatedAt: '2024-02-20T00:00:00.000Z',
    customer: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    },
    vehicle: {
      id: 1,
      brand: 'Toyota',
      model: 'Corolla',
      plate: 'ABC1234'
    }
  };

  const mockResponse: ApiResponse<Rental[]> = {
    data: [mockRental],
    message: 'Success'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all rentals', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await rentalService.findAll();

      expect(result).toEqual(mockResponse);
      expect(api.get).toHaveBeenCalledWith('/rentals');
    });
  });

  describe('findById', () => {
    it('should return a rental by id', async () => {
      const mockSingleResponse: ApiResponse<Rental> = {
        data: mockRental,
        message: 'Success'
      };

      (api.get as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const result = await rentalService.findById('1');

      expect(result).toEqual(mockSingleResponse);
      expect(api.get).toHaveBeenCalledWith('/rentals/1');
    });
  });

  describe('findByCustomerId', () => {
    it('should return rentals by customer id', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await rentalService.findByCustomerId('1');

      expect(result).toEqual(mockResponse);
      expect(api.get).toHaveBeenCalledWith('/rentals/customer/1');
    });
  });

  describe('findByVehicleId', () => {
    it('should return rentals by vehicle id', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await rentalService.findByVehicleId('1');

      expect(result).toEqual(mockResponse);
      expect(api.get).toHaveBeenCalledWith('/rentals/vehicle/1');
    });
  });

  describe('findByStatus', () => {
    it('should return rentals by status', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await rentalService.findByStatus(RentalStatus.PENDING);

      expect(result).toEqual(mockResponse);
      expect(api.get).toHaveBeenCalledWith('/rentals/status/PENDING');
    });
  });

  describe('findByPeriod', () => {
    it('should return rentals by period', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const startDate = new Date('2024-02-20');
      const endDate = new Date('2024-02-27');

      const result = await rentalService.findByPeriod(startDate, endDate);

      expect(result).toEqual(mockResponse);
      expect(api.get).toHaveBeenCalledWith('/rentals/period', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
    });
  });

  describe('create', () => {
    it('should create a new rental', async () => {
      const mockSingleResponse: ApiResponse<Rental> = {
        data: mockRental,
        message: 'Success'
      };

      (api.post as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const newRental = {
        customerId: 1,
        vehicleId: 1,
        startDate: '2024-02-20T00:00:00.000Z',
        endDate: '2024-02-27T00:00:00.000Z'
      };

      const result = await rentalService.create(newRental);

      expect(result).toEqual(mockSingleResponse);
      expect(api.post).toHaveBeenCalledWith('/rentals', newRental);
    });
  });

  describe('update', () => {
    it('should update a rental', async () => {
      const mockSingleResponse: ApiResponse<Rental> = {
        data: mockRental,
        message: 'Success'
      };

      (api.put as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const updateData = {
        endDate: '2024-02-28T00:00:00.000Z'
      };

      const result = await rentalService.update('1', updateData);

      expect(result).toEqual(mockSingleResponse);
      expect(api.put).toHaveBeenCalledWith('/rentals/1', updateData);
    });
  });

  describe('startRental', () => {
    it('should start a rental', async () => {
      const mockSingleResponse: ApiResponse<Rental> = {
        data: { ...mockRental, status: RentalStatus.ACTIVE },
        message: 'Success'
      };

      (api.post as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const result = await rentalService.startRental('1');

      expect(result).toEqual(mockSingleResponse);
      expect(api.post).toHaveBeenCalledWith('/rentals/1/start');
    });
  });

  describe('completeRental', () => {
    it('should complete a rental', async () => {
      const mockSingleResponse: ApiResponse<Rental> = {
        data: { ...mockRental, status: RentalStatus.COMPLETED },
        message: 'Success'
      };

      (api.post as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const result = await rentalService.completeRental('1');

      expect(result).toEqual(mockSingleResponse);
      expect(api.post).toHaveBeenCalledWith('/rentals/1/complete');
    });
  });

  describe('cancelRental', () => {
    it('should cancel a rental', async () => {
      const mockSingleResponse: ApiResponse<Rental> = {
        data: { ...mockRental, status: RentalStatus.CANCELLED },
        message: 'Success'
      };

      (api.post as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const result = await rentalService.cancelRental('1', 'Customer requested cancellation');

      expect(result).toEqual(mockSingleResponse);
      expect(api.post).toHaveBeenCalledWith('/rentals/1/cancel', {
        reason: 'Customer requested cancellation'
      });
    });
  });
}); 