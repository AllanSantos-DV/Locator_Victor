import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

interface QueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

interface MutationOptions<T, V> {
  mutationKey: string;
  mutationFn: (variables: V) => Promise<T>;
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: AxiosError, variables: V) => void;
  invalidateQueries?: string[];
}

/**
 * Hook personalizado para gerenciar o cache de requisições
 * @param options Opções da query
 * @returns Resultado da query
 */
export function useQueryCache<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutos
  gcTime = 10 * 60 * 1000, // 10 minutos
}: QueryOptions<T>) {
  return useQuery<T>({
    queryKey,
    queryFn,
    enabled,
    staleTime,
    gcTime,
  });
}

/**
 * Hook personalizado para gerenciar mutações com cache
 * @param options Opções da mutação
 * @returns Função de mutação e estado
 */
export function useMutationCache<T, V>({
  mutationKey,
  mutationFn,
  onSuccess,
  onError,
  invalidateQueries = [],
}: MutationOptions<T, V>) {
  const queryClient = useQueryClient();

  return useMutation<T, AxiosError, V>({
    mutationKey: [mutationKey],
    mutationFn,
    onSuccess: (data, variables) => {
      if (onSuccess) {
        onSuccess(data, variables);
      }
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach((queryKey: string) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
    },
    onError: (error, variables) => {
      if (onError && error instanceof AxiosError) {
        onError(error, variables);
      }
    },
  });
} 