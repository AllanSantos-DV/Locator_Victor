import { getEnv } from './env';

interface ApiConfig {
  baseURL: string;
  timeout: number;
  tokenKey: string;
  refreshTokenKey: string;
}

export const config: {
  api: ApiConfig;
} = {
  api: {
    baseURL: getEnv('REACT_APP_API_URL', 'http://localhost:8080'),
    timeout: parseInt(getEnv('REACT_APP_API_TIMEOUT', '15000'), 10),
    tokenKey: getEnv('REACT_APP_TOKEN_KEY', '@CarRent:token'),
    refreshTokenKey: getEnv('REACT_APP_REFRESH_TOKEN_KEY', '@CarRent:refreshToken'),
  },
}; 