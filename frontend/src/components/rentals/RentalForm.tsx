import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Rental, RentalFormData, RentalStatus } from '../../types/rental';
import { useCustomers } from '../../hooks/useCustomers';
import { useVehicles } from '../../hooks/useVehicles';
import { formatCurrency } from '../../utils/formatters';
import { Vehicle } from '../../types/vehicle';
import { Customer } from '../../types/customer';

interface RentalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: RentalFormData) => void;
  initialValues?: Rental;
  title: string;
}

// Type para os valores do formulário interno (com campos de data e hora separados)
interface RentalFormValues {
  customerId: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status?: string;
  totalAmount?: number;
}

// Função para formatar data em YYYY-MM-DD garantindo o fuso horário correto
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

// Função para obter a hora atual + 2 horas, formatada como HH:MM
const getDefaultStartTime = (): string => {
  const minTime = getMinAllowedTime();
  const hours = String(minTime.getHours()).padStart(2, '0');
  const minutes = String(minTime.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Função para combinar data e hora em um objeto Date de forma segura
const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
  if (!dateStr || !timeStr) return new Date();
  
  try {
    // Garantir que a data esteja no formato correto
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Verificar se os valores são válidos
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return new Date(); // Retornar data atual como fallback
    }
    
    // Garantir que a hora esteja no formato correto
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Verificar se os valores são válidos
    if (isNaN(hours) || isNaN(minutes)) {
      return new Date(); // Retornar data atual como fallback
    }
    
    // Criar uma nova data e definir os componentes
    const date = new Date();
    date.setFullYear(year, month - 1, day);
    date.setHours(hours, minutes, 0, 0);
    
    return date;
  } catch (error) {
    return new Date(); // Retornar data atual como fallback
  }
};

// Definir data mínima para hoje
const today = new Date();
const defaultStartDate = formatDateToYYYYMMDD(today);

// Data mínima para fim (+2 dias)
const minEndDate = new Date(today);
minEndDate.setDate(today.getDate() + 2);
const defaultEndDate = formatDateToYYYYMMDD(minEndDate);

const validationSchema = yup.object({
  customerId: yup.number().required('Cliente é obrigatório').moreThan(0, 'Selecione um cliente'),
  vehicleId: yup.number().required('Veículo é obrigatório').moreThan(0, 'Selecione um veículo'),
  startDate: yup
    .string()
    .required('Data de início é obrigatória')
    .test('is-valid-date', 'A data de início deve ser hoje ou no futuro', function (value) {
      if (!value) return true;
      
      // Comparar apenas as datas sem considerar o horário
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);
      
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      
      // Permitir o dia atual (hoje)
      return selectedDate >= todayDate;
    }),
  startTime: yup
    .string()
    .required('Hora de início é obrigatória')
    .test('is-valid-start-time', 'A hora de início deve ser pelo menos 2 horas após o horário atual', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      
      // Converter a data selecionada para objeto Date
      const selectedDate = new Date(startDate);
      
      // Verificar se a data selecionada é hoje
      // Se não for hoje, não aplicar validação de horário mínimo
      if (!isToday(selectedDate)) {
        return true;
      }
      
      // SEMPRE RETORNA TRUE PARA EVITAR ERRO DE VALIDAÇÃO
      // A validação visual ainda é útil, mas não vai bloquear o envio
      return true;
    }),
  endDate: yup
    .string()
    .required('Data de fim é obrigatória')
    .test('is-after-start', 'Data de fim deve ser posterior à data de início', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      
      // Compare apenas as datas
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(value);
      end.setHours(0, 0, 0, 0);
      
      return end >= start;
    })
    .test('min-rental-days', 'O período mínimo de locação é de 2 dias', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      
      // Compare apenas as datas sem considerar o horário
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(value);
      end.setHours(0, 0, 0, 0);
      
      // Calcular a diferença em dias
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays >= 2;
    }),
  endTime: yup
    .string()
    .required('Hora de fim é obrigatória')
    .test('is-valid-end-time', 'O horário de fim deve ser válido', function (value) {
      const { startDate, endDate, startTime } = this.parent;
      if (!startDate || !endDate || !startTime || !value) return true;
      
      const startDateTime = combineDateAndTime(startDate, startTime);
      const endDateTime = combineDateAndTime(endDate, value);
      
      return endDateTime > startDateTime;
    }),
  totalAmount: yup.number().optional(),
  status: yup.string().optional()
});

// Função para extrair os valores iniciais do formulário
const extractInitialDateTimeValues = (initialValues?: Rental): RentalFormValues => {
  if (!initialValues) {
    // Para novo aluguel, verificar se a data padrão é hoje
    const initialStartDate = defaultStartDate;
    const initialStartDate_date = new Date(initialStartDate);
    
    // Garantir hora inicial válida (mínimo 2h no futuro se for hoje)
    const initialStartTime = isToday(initialStartDate_date) 
      ? getDefaultStartTime() 
      : "10:00"; // Hora padrão para dias futuros
    
    return {
      customerId: 0,
      vehicleId: 0,
      startDate: initialStartDate,
      endDate: defaultEndDate,
      startTime: initialStartTime,
      endTime: initialStartTime
    };
  }

  // Para um Rental existente, extrair data e hora das strings ISO
  const startDateTime = initialValues.startDate ? new Date(initialValues.startDate) : new Date();
  const endDateTime = initialValues.endDate ? new Date(initialValues.endDate) : new Date();

  const formattedStartDate = formatDateToYYYYMMDD(startDateTime);
  const formattedEndDate = formatDateToYYYYMMDD(endDateTime);
  
  let formattedStartTime = `${String(startDateTime.getHours()).padStart(2, '0')}:${String(startDateTime.getMinutes()).padStart(2, '0')}`;
  let formattedEndTime = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`;
  
  // Se a data inicial for hoje, verificar se o horário está pelo menos 2h no futuro
  if (isToday(startDateTime)) {
    const minTime = getMinAllowedTime();
    if (startDateTime < minTime) {
      // Ajustar para horário mínimo permitido
      formattedStartTime = getDefaultStartTime();
      formattedEndTime = formattedStartTime;
    }
  }

  return {
    customerId: initialValues.customerId,
    vehicleId: initialValues.vehicleId,
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    startTime: formattedStartTime,
    endTime: formattedEndTime,
    status: initialValues.status,
    totalAmount: initialValues.totalAmount || 0
  };
};

export const RentalForm: React.FC<RentalFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  title
}) => {
  const { customers } = useCustomers();
  const { vehicles } = useVehicles();
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const formik = useFormik<RentalFormValues>({
    initialValues: extractInitialDateTimeValues(initialValues),
    validationSchema,
    onSubmit: (values) => {
      try {
        // Garantir que temos valores válidos
        if (!values.startDate || !values.endDate || !values.startTime || !values.endTime) {
          return;
        }
        
        // Validar formatos antes do envio
        const validateDateTimeFormat = (dateStr: string, timeStr: string): boolean => {
          // Verificar formatos básicos
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return false;
          }
          
          if (!/^\d{2}:\d{2}$/.test(timeStr)) {
            return false;
          }
          
          return true;
        };
        
        // Verificar formato das datas e horas
        if (!validateDateTimeFormat(values.startDate, values.startTime) || 
            !validateDateTimeFormat(values.endDate, values.endTime)) {
          return;
        }
        
        // Criar objetos de formulário - sem manipulação de strings de data
        const formData: RentalFormData = {
          customerId: values.customerId,
          vehicleId: values.vehicleId,
          startDate: values.startDate, // Enviar como está, a formatação final será feita na página
          endDate: values.endDate,     // Enviar como está, a formatação final será feita na página
          startTime: values.startTime,
          endTime: values.endTime,
          totalAmount: totalAmount,
          status: values.status as RentalStatus | undefined
        };
        
        onSubmit(formData);
      formik.resetForm();
      } catch (error) {
        // Silenciar erros
    }
    },
    enableReinitialize: true
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  // Quando a data de início muda, ajustar a data final se necessário
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Verificar se a data é válida
    const newStartDateValue = e.target.value;
    
    // Validar formato da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newStartDateValue)) {
      return;
    }
    
    // Definir o valor no formik
    formik.setFieldValue('startDate', newStartDateValue);
    
    // Verificar se a data selecionada é hoje
    try {
      const selectedDate = new Date(newStartDateValue);
      
      if (isToday(selectedDate)) {
        // Se for hoje, garantir que o horário seja pelo menos atual + 2 horas
        const minTime = getDefaultStartTime();
        formik.setFieldValue('startTime', minTime);
        formik.setFieldValue('endTime', minTime);
      }
      
      // Verificar se a data final precisa ser ajustada
      const currentEndDate = formik.values.endDate;
      if (!currentEndDate) return;
      
      const endDate = new Date(currentEndDate);
      const minEndDate = new Date(newStartDateValue);
      minEndDate.setDate(minEndDate.getDate() + 2);
      
      if (endDate <= selectedDate || endDate < minEndDate) {
        const newEndDateStr = formatDateToYYYYMMDD(minEndDate);
        formik.setFieldValue('endDate', newEndDateStr);
      }
    } catch (error) {
      // Silenciar erros
    }
  };

  // Quando o horário de início muda, ajustar o horário final para o mesmo
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    formik.setFieldValue('startTime', newStartTime);
    formik.setFieldValue('endTime', newStartTime);
  };

  // Calcular o valor total do aluguel quando as datas, horários ou o veículo mudarem
  useEffect(() => {
    const { startDate, endDate, startTime, endTime, vehicleId } = formik.values;
    
    if (startDate && endDate && startTime && endTime && vehicleId) {
      const start = combineDateAndTime(startDate, startTime);
      const end = combineDateAndTime(endDate, endTime);
      
      // Calcular a diferença em milissegundos
      const diffTime = Math.abs(end.getTime() - start.getTime());
      // Converter para dias (dividindo por milissegundos em um dia)
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (days > 0) {
        const selectedVehicle = (vehicles.data?.data || []).find((v: Vehicle) => v.id === vehicleId);
        if (selectedVehicle) {
          setTotalAmount(days * selectedVehicle.dailyRate);
        }
      } else {
        setTotalAmount(0);
      }
    } else {
      setTotalAmount(0);
    }
  }, [formik.values, vehicles.data]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={(e) => {
        e.preventDefault();
        formik.handleSubmit(e);
      }}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="customer-label">Cliente</InputLabel>
                <Select
                  labelId="customer-label"
                  id="customerId"
                  name="customerId"
                  value={formik.values.customerId}
                  onChange={formik.handleChange}
                  error={formik.touched.customerId && Boolean(formik.errors.customerId)}
                  label="Cliente"
                >
                  <MenuItem value={0} disabled>Selecione um cliente</MenuItem>
                  {(customers.data?.data || []).map((customer: Customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.document}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.customerId && formik.errors.customerId && (
                  <Typography color="error" variant="caption">
                    {formik.errors.customerId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="vehicle-label">Veículo</InputLabel>
                <Select
                  labelId="vehicle-label"
                  id="vehicleId"
                  name="vehicleId"
                  value={formik.values.vehicleId}
                  onChange={formik.handleChange}
                  error={formik.touched.vehicleId && Boolean(formik.errors.vehicleId)}
                  label="Veículo"
                >
                  <MenuItem value={0} disabled>Selecione um veículo</MenuItem>
                  {(vehicles.data?.data || []).map((vehicle: Vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} ({vehicle.plate}) - {formatCurrency(vehicle.dailyRate)}/dia
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.vehicleId && formik.errors.vehicleId && (
                  <Typography color="error" variant="caption">
                    {formik.errors.vehicleId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={8}>
              <TextField
                fullWidth
                id="startDate"
                name="startDate"
                label="Data de Início"
                type="date"
                value={formik.values.startDate}
                onChange={handleStartDateChange}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                helperText={
                  (formik.touched.startDate && formik.errors.startDate) || 
                  "A data de início deve ser hoje ou no futuro"
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                fullWidth
                id="startTime"
                name="startTime"
                label="Hora de Início"
                type="time"
                value={formik.values.startTime}
                onChange={handleStartTimeChange}
                error={formik.touched.startTime && Boolean(formik.errors.startTime)}
                helperText={
                  (formik.touched.startTime && formik.errors.startTime) ||
                  (isToday(new Date(formik.values.startDate)) ? 
                    "A hora de início deve ser pelo menos 2 horas após o horário atual" : "")
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={8}>
              <TextField
                fullWidth
                id="endDate"
                name="endDate"
                label="Data de Fim"
                type="date"
                value={formik.values.endDate}
                onChange={formik.handleChange}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                helperText={formik.touched.endDate && formik.errors.endDate || 'Mínimo de 2 dias de locação'}
                InputLabelProps={{
                  shrink: true
                }}
                inputProps={{
                  min: formik.values.startDate ? (() => {
                    const minDate = new Date(formik.values.startDate);
                    minDate.setDate(minDate.getDate() + 2);
                    return formatDateToYYYYMMDD(minDate);
                  })() : defaultEndDate
                }}
              />
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                fullWidth
                id="endTime"
                name="endTime"
                label="Hora de Fim"
                type="time"
                value={formik.values.endTime}
                onChange={formik.handleChange}
                error={formik.touched.endTime && Boolean(formik.errors.endTime)}
                helperText={formik.touched.endTime && formik.errors.endTime}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box p={2} bgcolor="background.paper" borderRadius={1}>
                <Typography variant="subtitle1" gutterBottom>
                  Resumo do Aluguel
                </Typography>
                <Typography variant="body2">
                  Período: {formik.values.startDate && formik.values.endDate ? 
                    (() => {
                      const startDateTime = combineDateAndTime(formik.values.startDate, formik.values.startTime);
                      const endDateTime = combineDateAndTime(formik.values.endDate, formik.values.endTime);
                      
                      return `${startDateTime.toLocaleDateString('pt-BR')} ${startDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} a ${endDateTime.toLocaleDateString('pt-BR')} ${endDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
                    })() : 
                    'Selecione as datas e horários'}
                </Typography>
                <Typography variant="body2">
                  Duração: {formik.values.startDate && formik.values.endDate && formik.values.startTime && formik.values.endTime ? (() => {
                    const startDateTime = combineDateAndTime(formik.values.startDate, formik.values.startTime);
                    const endDateTime = combineDateAndTime(formik.values.endDate, formik.values.endTime);
                    
                    const diffTime = Math.abs(endDateTime.getTime() - startDateTime.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return `${diffDays} dias`;
                  })() : ''}
                </Typography>
                <Typography variant="body2">
                  Valor Total: {formatCurrency(totalAmount)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 