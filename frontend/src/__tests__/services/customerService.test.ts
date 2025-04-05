import { customerService } from '../../services/customerService';
import { Customer } from '../../types/customer';
import { ApiResponse } from '../../types/common';
import { api } from '../../services/api';

jest.mock('../../services/api');

describe('customerService', () => {
  const mockCustomer: Customer = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    document: '123.456.789-00',
    phone: '(11) 99999-9999',
    address: 'Rua Example, 123',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  const mockResponse: ApiResponse<Customer[]> = {
    data: [mockCustomer],
    message: 'Success'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await customerService.findAll();

      expect(result).toEqual(mockResponse);
      expect(api.get).toHaveBeenCalledWith('/customers');
    });
  });

  describe('findById', () => {
    it('should return a customer by id', async () => {
      const mockSingleResponse: ApiResponse<Customer> = {
        data: mockCustomer,
        message: 'Success'
      };

      (api.get as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const result = await customerService.findById('1');

      expect(result).toEqual(mockSingleResponse);
      expect(api.get).toHaveBeenCalledWith('/customers/1');
    });
  });

  describe('findByEmail', () => {
    it('should return a customer by email', async () => {
      const mockSingleResponse: ApiResponse<Customer> = {
        data: mockCustomer,
        message: 'Success'
      };

      (api.get as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const result = await customerService.findByEmail('john@example.com');

      expect(result).toEqual(mockSingleResponse);
      expect(api.get).toHaveBeenCalledWith('/customers/email/john@example.com');
    });
  });

  describe('findByDocument', () => {
    it('should return a customer by document', async () => {
      const mockSingleResponse: ApiResponse<Customer> = {
        data: mockCustomer,
        message: 'Success'
      };

      (api.get as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const result = await customerService.findByDocument('123.456.789-00');

      expect(result).toEqual(mockSingleResponse);
      expect(api.get).toHaveBeenCalledWith('/customers/document/123.456.789-00');
    });
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const mockSingleResponse: ApiResponse<Customer> = {
        data: mockCustomer,
        message: 'Success'
      };

      (api.post as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const newCustomer = {
        name: 'John Doe',
        email: 'john@example.com',
        document: '123.456.789-00',
        phone: '(11) 99999-9999',
        address: 'Rua Example, 123'
      };

      const result = await customerService.create(newCustomer);

      expect(result).toEqual(mockSingleResponse);
      expect(api.post).toHaveBeenCalledWith('/customers', newCustomer);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const mockSingleResponse: ApiResponse<Customer> = {
        data: mockCustomer,
        message: 'Success'
      };

      (api.put as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const updateData = {
        phone: '(11) 88888-8888'
      };

      const result = await customerService.update('1', updateData);

      expect(result).toEqual(mockSingleResponse);
      expect(api.put).toHaveBeenCalledWith('/customers/1', updateData);
    });
  });

  describe('delete', () => {
    it('should delete a customer', async () => {
      const mockSingleResponse: ApiResponse<void> = {
        data: undefined,
        message: 'Success'
      };

      (api.delete as jest.Mock).mockResolvedValueOnce(mockSingleResponse);

      const result = await customerService.delete('1');

      expect(result).toEqual(mockSingleResponse);
      expect(api.delete).toHaveBeenCalledWith('/customers/1');
    });
  });
}); 