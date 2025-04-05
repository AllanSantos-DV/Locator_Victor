import axios from 'axios';
import { config } from '../utils/config';

export const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  } 
});

// Request interceptor
api.interceptors.request.use(
  (requestConfig) => {
    // Tentar obter o token do localStorage
    const tokenValue = localStorage.getItem('@CarRent:token');
    
    // Se existir token, adicionar ao cabeçalho da requisição
    if (tokenValue) {
      requestConfig.headers.Authorization = `Bearer ${tokenValue}`;
    }
    
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Se for erro 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tentar renovar o token
        const refreshToken = localStorage.getItem('@CarRent:refreshToken');
        
        if (!refreshToken) {
          throw new Error('Refresh token não disponível');
        }
        
        // Chamar a API para obter novo token
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, refreshToken, {
          headers: {
            'Content-Type': 'text/plain'
          }
        });
        
        // Armazenar os novos tokens
        const { token, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('@CarRent:token', token);
        localStorage.setItem('@CarRent:refreshToken', newRefreshToken);
        
        // Atualizar o token na requisição original e retentar
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Se falhar o refresh, limpar tokens e redirecionar para login
        localStorage.removeItem('@CarRent:token');
        localStorage.removeItem('@CarRent:refreshToken');
        localStorage.removeItem('@CarRent:user');
        
        // Se estiver em ambiente de navegador, redirecionar para login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
); 