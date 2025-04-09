import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  token: string;
  refreshToken: string;
  user: User | null;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(user: User): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@CarRent:token');
    const refreshToken = localStorage.getItem('@CarRent:refreshToken');
    const userStr = localStorage.getItem('@CarRent:user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        api.defaults.headers.Authorization = `Bearer ${token}`;
        return { 
          token, 
          refreshToken: refreshToken || '', 
          user 
        };
      } catch (error) {
        // Se houver erro ao fazer parse do JSON, limpar localStorage
        localStorage.removeItem('@CarRent:token');
        localStorage.removeItem('@CarRent:refreshToken');
        localStorage.removeItem('@CarRent:user');
      }
    }

    return { 
      token: '', 
      refreshToken: '', 
      user: null 
    };
  });

  const signIn = useCallback(async ({ email, password }: SignInCredentials): Promise<void> => {
    try {
      // Fazer a requisição de login
      const response = await api.post('/auth/authenticate', {
        email,
        password,
      });
      
      // Extrair token e dados do usuário da resposta
      const { token, refreshToken, user } = response.data;
      
      // Armazenar token e dados do usuário
      localStorage.setItem('@CarRent:token', token);
      localStorage.setItem('@CarRent:refreshToken', refreshToken);
      localStorage.setItem('@CarRent:user', JSON.stringify(user));
      
      // Definir token para próximas requisições
      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      // Atualizar estado
      setData({ token, refreshToken, user });
    } catch (error) {
      // Limpar dados em caso de erro
      localStorage.removeItem('@CarRent:token');
      localStorage.removeItem('@CarRent:refreshToken');
      localStorage.removeItem('@CarRent:user');
      setData({ token: '', refreshToken: '', user: null });
      throw error;
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@CarRent:token');
    localStorage.removeItem('@CarRent:refreshToken');
    localStorage.removeItem('@CarRent:user');

    delete api.defaults.headers.Authorization;
    setData({ token: '', refreshToken: '', user: null });
  }, []);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem('@CarRent:user', JSON.stringify(user));
    setData(prev => ({ ...prev, user }));
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: data.refreshToken,
      });

      const { token, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem('@CarRent:token', token);
      localStorage.setItem('@CarRent:refreshToken', newRefreshToken);

      api.defaults.headers.Authorization = `Bearer ${token}`;

      setData(prev => ({ ...prev, token, refreshToken: newRefreshToken }));
    } catch (error) {
      signOut();
    }
  }, [data.refreshToken, signOut]);

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (data.token) {
        const decoded: any = jwtDecode(data.token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          refreshToken();
        }
      }
    };

    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000); // Verificar a cada 5 minutos

    return () => clearInterval(interval);
  }, [data.token, refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        user: data.user,
        isAuthenticated: !!(data.token && data.user),
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}; 