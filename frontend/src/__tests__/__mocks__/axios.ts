import { AxiosResponse } from 'axios';
import { ApiResponse } from '../../types/common';

export const mockAxiosResponse = <T>(data: T, status = 200, message?: string): AxiosResponse<ApiResponse<T>> => ({
  data: {
    data,
    message,
    error: undefined
  },
  status,
  statusText: 'OK',
  headers: {},
  config: {} as any
});

export const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  create: jest.fn().mockReturnThis(),
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn()
    },
    response: {
      use: jest.fn(),
      eject: jest.fn()
    }
  }
}; 