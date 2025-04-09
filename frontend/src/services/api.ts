import axios from 'axios';
import { config } from '../utils/config';

export const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  } 
});

// Request interceptor
api.interceptors.request.use(
  (requestConfig) => {
    // Tentar obter o token do localStorage
    const tokenValue = localStorage.getItem(config.api.tokenKey);
    
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
    
    // Verificar se o erro é por token expirado pelo header específico
    if (error.response?.headers?.['x-jwt-expired'] === 'true') {
      // Limpar tokens e redirecionar para login
      localStorage.removeItem(config.api.tokenKey);
      localStorage.removeItem(config.api.refreshTokenKey);
      localStorage.removeItem('@CarRent:user');
      
      // Redirecionar para login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
    
    // Se for erro 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tentar renovar o token
        const refreshToken = localStorage.getItem(config.api.refreshTokenKey);
        
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
        localStorage.setItem(config.api.tokenKey, token);
        localStorage.setItem(config.api.refreshTokenKey, newRefreshToken);
        
        // Atualizar o token na requisição original e retentar
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Se falhar o refresh, limpar tokens e redirecionar para login
        localStorage.removeItem(config.api.tokenKey);
        localStorage.removeItem(config.api.refreshTokenKey);
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