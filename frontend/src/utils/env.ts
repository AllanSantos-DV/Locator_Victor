/**
 * Retorna o valor de uma variável de ambiente, ou um valor padrão caso não esteja definida
 * @param name - Nome da variável de ambiente
 * @param defaultValue - Valor padrão a ser retornado caso a variável não esteja definida
 */
export const getEnv = (name: string, defaultValue = ''): string => {
  // Acessamos process.env diretamente para obter a variável
  const value = (process.env as Record<string, string | undefined>)[name];
  
  // Retorna o valor ou o defaultValue caso seja undefined
  return value !== undefined ? value : defaultValue;
}; 