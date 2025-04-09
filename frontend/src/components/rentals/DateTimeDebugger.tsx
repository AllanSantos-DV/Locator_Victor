import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';

// Função para verificar se uma data é hoje
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// Função para obter a hora mínima permitida (atual + 2 horas)
const getMinAllowedTime = (): Date => {
  const now = new Date();
  return new Date(now.getTime() + 2 * 60 * 60 * 1000);
};

export const DateTimeDebugger: React.FC<{ testDate?: string; testTime?: string }> = ({
  testDate: propTestDate = "2025-04-06",
  testTime: propTestTime = "23:00"
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [minAllowedTime, setMinAllowedTime] = useState<Date>(getMinAllowedTime());
  
  // Usar os props ou os valores padrão
  const testDate = propTestDate; // Formatar como YYYY-MM-DD
  const testTime = propTestTime; // Formatar como HH:MM
  
  // Criar objeto de data a partir da string
  const testDateTime = new Date(`${testDate}T${testTime}:00`);
  
  // Verificar se a data de teste é hoje
  const isTestDateToday = isToday(testDateTime);
  
  // Verificar se a hora de teste é válida (pelo menos 2h após o horário atual)
  const isTestTimeValid = testDateTime >= minAllowedTime;
  
  // Atualizar o horário atual a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setMinAllowedTime(getMinAllowedTime());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Debugger de Data/Hora</Typography>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Horários do Sistema:</Typography>
        <Typography>Data e hora atual: {currentTime.toLocaleString()}</Typography>
        <Typography>Horário mínimo permitido (atual + 2h): {minAllowedTime.toLocaleString()}</Typography>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Teste de Data/Hora:</Typography>
        <Typography>Data de teste: {testDate}</Typography>
        <Typography>Hora de teste: {testTime}</Typography>
        <Typography>Data/hora combinadas: {testDateTime.toLocaleString()}</Typography>
        <Typography>É hoje? {isTestDateToday ? 'Sim' : 'Não'}</Typography>
        <Typography>Hora válida (maior ou igual ao mínimo permitido)? {isTestTimeValid ? 'Sim' : 'Não'}</Typography>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Valores da validação:</Typography>
        <Typography>timezone offset local: {currentTime.getTimezoneOffset()}</Typography>
        <Typography>Data atual como objeto: {currentTime.toString()}</Typography>
        <Typography>Data teste como objeto: {testDateTime.toString()}</Typography>
      </Box>
      
      <Button 
        variant="contained" 
        sx={{ mt: 2 }}
        onClick={() => {
          console.log('=== TESTE DATA/HORA ===');
          console.log('Data/hora atual:', currentTime);
          console.log('Mínimo permitido:', minAllowedTime);
          console.log('Data de teste:', testDateTime);
          console.log('É hoje?', isTestDateToday);
          console.log('É válido?', isTestTimeValid);
          
          // Simulando a validação completa
          if (isTestDateToday && !isTestTimeValid) {
            console.log('ERRO: Horário deve ser pelo menos 2 horas após o atual');
          } else {
            console.log('Validação passou com sucesso!');
          }
        }}
      >
        Testar no Console
      </Button>
    </Paper>
  );
}; 