import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      staleTime: 30 * 1000, // 30 segundos (reduzido de 5 minutos)
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnMount: true,
      refetchOnReconnect: true,
      throwOnError: true
    },
    mutations: {
      retry: 1,
      throwOnError: true
    }
  }
}); 