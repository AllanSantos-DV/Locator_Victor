import React, { useEffect, useState, useRef } from 'react';
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
import { useRentals } from '../../hooks/useRentals';

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
  vehicleDailyRate?: number;
  notes?: string;
}

// Função para formatar data em YYYY-MM-DD garantindo o fuso horário correto
const formatDateToYYYYMMDD = (date: Date): string => {
  // Cria uma nova data para não alterar a original
  const localDate = new Date(date);
  
  // Adicionar o timezone offset para garantir que a data local seja mantida
  // Isso corrige o problema do dia estar sendo definido incorretamente
  const offset = localDate.getTimezoneOffset();
  localDate.setMinutes(localDate.getMinutes() - offset);
  
  // Retorna apenas a parte da data YYYY-MM-DD
  return localDate.toISOString().split('T')[0];
};

// Função para verificar se uma data é hoje
const isToday = (date: Date): boolean => {
  try {
    // Extrair apenas o ano, mês e dia da data
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const dateDay = date.getDate();
    
    // Obter a data atual
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    
    // Comparar se os componentes da data são iguais
    return dateYear === todayYear && 
           dateMonth === todayMonth && 
           dateDay === todayDay;
  } catch (error) {
    return false;
  }
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
  try {
    // Garantir que temos uma data no formato correto (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error(`Formato de data inválido: ${dateStr}`);
    }
    
    // Garantir que temos um horário no formato correto (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(timeStr)) {
      throw new Error(`Formato de hora inválido: ${timeStr}`);
    }
    
    // Extrair componentes da data
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Extrair hora e minutos
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Criar objeto de data (mês em JavaScript é base 0)
    const dateObj = new Date(year, month - 1, day, hours, minutes, 0, 0);
    
    return dateObj;
  } catch (error) {
    // Em caso de erro, retornar a data atual como fallback
    return new Date();
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
    .test('is-valid-date-format', 'Formato de data inválido', function(value) {
      return value ? /^\d{4}-\d{2}-\d{2}$/.test(value) : false;
    })
    .test('is-valid-date', 'A data de início deve ser hoje ou no futuro', function (value) {
      if (!value) return false;
      
      try {
        // Converter para Date no formato ISO para garantir consistência
        const selectedDate = new Date(value + "T00:00:00Z");
        
        // Obter apenas a data atual, sem o horário
        const today = new Date();
        const todayDate = new Date(today.toISOString().split('T')[0] + "T00:00:00Z");
        
        // Comparar as datas considerando apenas o dia (sem horas)
        return selectedDate >= todayDate;
      } catch (error) {
        return false;
      }
    }),
  startTime: yup
    .string()
    .required('Hora de início é obrigatória')
    .test('is-valid-time-format', 'Formato de hora inválido', function(value) {
      return value ? /^\d{2}:\d{2}$/.test(value) : false;
    })
    .test('is-valid-start-time', 'A hora de início deve ser pelo menos 2 horas após o horário atual', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return false;
      
      try {
        // Verificar se é hoje usando uma comparação direta de datas
        const selectedDate = new Date(startDate + "T00:00:00Z");
        
        const today = new Date();
        const todayDate = new Date(today.toISOString().split('T')[0] + "T00:00:00Z");
        
        const isSelectedToday = selectedDate.getTime() === todayDate.getTime();
        
        // Se não for hoje, qualquer horário é válido
        if (!isSelectedToday) {
          return true;
        }
      
        // Se for hoje, verificar se o horário é pelo menos 2 horas após o atual
        const [hours, minutes] = value.split(':').map(Number);
        
        const selectedTime = new Date();
        selectedTime.setHours(hours, minutes, 0, 0);
        
        const timeNow = new Date();
        const minAllowedTime = new Date();
        minAllowedTime.setTime(timeNow.getTime() + 2 * 60 * 60 * 1000);
        
        return selectedTime.getTime() >= minAllowedTime.getTime();
      } catch (error) {
        return false;
      }
    }),
  endDate: yup
    .string()
    .required('Data de fim é obrigatória')
    .test('is-valid-end-date-format', 'Formato de data inválido', function(value) {
      return value ? /^\d{4}-\d{2}-\d{2}$/.test(value) : false;
    })
    .test('is-after-start', 'Data de fim deve ser posterior à data de início', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return false;
      
      try {
        // Converter para Date no formato ISO
        const startDateStr = startDate + "T00:00:00.000Z";
        const endDateStr = value + "T00:00:00.000Z";
        
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
      
      return end >= start;
      } catch (error) {
        return false;
      }
    })
    .test('min-rental-days', 'O período mínimo de locação é de 2 dias', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return false;
      
      try {
        // Converter para Date no formato ISO
        const startDateStr = startDate + "T00:00:00.000Z";
        const endDateStr = value + "T00:00:00.000Z";
        
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
      
      // Calcular a diferença em dias
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays >= 2;
      } catch (error) {
        return false;
      }
    }),
  endTime: yup
    .string()
    .required('Hora de fim é obrigatória')
    .test('is-valid-end-time-format', 'Formato de hora inválido', function(value) {
      return value ? /^\d{2}:\d{2}$/.test(value) : false;
    })
    .test('is-valid-end-time', 'O horário de fim deve ser válido', function (value) {
      const { startDate, endDate, startTime } = this.parent;
      if (!startDate || !endDate || !startTime || !value) return false;
      
      const startDateTime = combineDateAndTime(startDate, startTime);
      const endDateTime = combineDateAndTime(endDate, value);
      
      return endDateTime > startDateTime;
    }),
  totalAmount: yup.number().optional(),
  status: yup.string().optional(),
  vehicleDailyRate: yup.number().optional(),
  notes: yup.string().optional()
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
    totalAmount: initialValues.totalAmount || 0,
    vehicleDailyRate: initialValues.vehicleDailyRate || 0,
    notes: initialValues.notes || ''
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
  const { rentals } = useRentals();
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const formikRef = useRef<any>(null);
  const [showMinTimeMsg, setShowMinTimeMsg] = useState<boolean>(false);
  const [minTimeValue, setMinTimeValue] = useState<string>("");

  // Função para filtrar clientes que já possuem aluguéis em andamento
  const filterAvailableCustomers = (customers: any[], rentals: any): any[] => {
    if (!rentals || !customers) return customers;
    
    // Obter dados reais de rentals considerando diferentes estruturas
    let rentalsData: any[] = [];
    if (rentals.data) {
      // Caso rentals seja um objeto com propriedade data (ApiResponse)
      rentalsData = Array.isArray(rentals.data) ? rentals.data : [];
    } else if (Array.isArray(rentals)) {
      // Caso rentals já seja um array
      rentalsData = rentals;
    }
    
    // Obter IDs de clientes com aluguéis em andamento
    const customersWithActiveRentals = new Set(
      rentalsData
        .filter(rental => rental.status === 'IN_PROGRESS')
        .map(rental => rental.customerId)
    );
    
    // Se estamos editando um aluguel existente, o cliente atual deve estar disponível
    const currentCustomerId = initialValues?.customerId;
    
    return customers.filter(customer => 
      !customersWithActiveRentals.has(customer.id) || customer.id === currentCustomerId
    );
  };
  
  // Função para filtrar veículos indisponíveis
  const filterAvailableVehicles = (vehicles: any[]) => {
    if (!vehicles) return vehicles;
    
    // Se estamos editando um aluguel existente, o veículo atual deve estar disponível
    const currentVehicleId = initialValues?.vehicleId;
    
    return vehicles.filter(vehicle => 
      (vehicle.available && vehicle.status === 'AVAILABLE') || vehicle.id === currentVehicleId
    );
  };
  
  // Obter listas filtradas
  const availableCustomers = filterAvailableCustomers(
    customers.data?.data || [], 
    rentals?.data || []
  );
  
  const availableVehicles = filterAvailableVehicles(vehicles.data?.data || []);

  const formik = useFormik<RentalFormValues>({
    initialValues: extractInitialDateTimeValues(initialValues),
    validationSchema,
    validateOnMount: false,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, actions) => {
      try {
        // Validar explicitamente o formulário
        const errors = await formik.validateForm();
        const hasErrors = Object.keys(errors).length > 0;
        
        if (hasErrors) {
          // Marcar todos os campos como tocados para mostrar os erros ao usuário
          formik.setTouched({
            customerId: true,
            vehicleId: true,
            startDate: true,
            startTime: true,
            endDate: true,
            endTime: true
          });
          
          return; // Não prosseguir com o envio se houver erros
        }
        
        // Processar as datas
        const startDateTime = combineDateAndTime(values.startDate, values.startTime);
        const endDateTime = combineDateAndTime(values.endDate, values.endTime);
        
        // Garantir que temos o valor total correto
        const finalTotalAmount = values.totalAmount && values.totalAmount > 0 
          ? values.totalAmount 
          : totalAmount; // usar o estado totalAmount como fallback
        
        // Criar objeto com dados finais para submissão
        const formData: RentalFormData = {
          customerId: values.customerId,
          vehicleId: values.vehicleId,
          startDate: values.startDate,
          endDate: values.endDate,
          startTime: values.startTime,
          endTime: values.endTime,
          // Garantir que totalAmount seja sempre um número positivo
          totalAmount: finalTotalAmount,
          vehicleDailyRate: values.vehicleDailyRate || 0,
          notes: values.notes || ''
        };
        
        // Chamar o método onSubmit do componente pai
        onSubmit(formData);
        actions.setSubmitting(false);
      } catch (error) {
        actions.setSubmitting(false);
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
    
    // Verificar se tem o formato correto de data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newStartDateValue)) {
      return;
    }
    
    try {
      // Verificar se a data não é anterior a hoje - usando o mesmo método da validação
      const selectedDateStr = newStartDateValue + "T00:00:00.000Z";
      const selectedDate = new Date(selectedDateStr);
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0] + "T00:00:00.000Z";
      const todayDate = new Date(todayStr);
      
      // Definir o valor no formik, mesmo que seja no passado
      // A validação do Yup irá mostrar o erro para o usuário
      formik.setFieldValue('startDate', newStartDateValue);
      
      // Ajustar data de fim para ser pelo menos 2 dias depois da data de início
      const currentEndDate = formik.values.endDate;
      if (currentEndDate) {
        const endDate = new Date(currentEndDate + "T00:00:00.000Z");
        const minEndDate = new Date(selectedDate.getTime());
      minEndDate.setDate(minEndDate.getDate() + 2);
      
        if (endDate < minEndDate) {
        const newEndDateStr = formatDateToYYYYMMDD(minEndDate);
        formik.setFieldValue('endDate', newEndDateStr);
        }
      }
    } catch (error) {
      // Silenciar erros
    }
  };

  // Quando o horário de início muda, ajustar o horário final para o mesmo
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    
    // Verificar formato do horário
    if (!/^\d{2}:\d{2}$/.test(newStartTime)) {
      return;
    }
    
    // Verificar se a data selecionada é hoje
    if (formik.values.startDate) {
      const selectedDate = new Date(formik.values.startDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      
      // Se for hoje, verificar se o horário é pelo menos 2h após o atual
      if (selectedDate.getTime() === todayDate.getTime()) {
        // Extrair hora e minutos
        const [hours, minutes] = newStartTime.split(':').map(Number);
        
        // Criar uma data com a hora selecionada
        const selectedTime = new Date();
        selectedTime.setHours(hours, minutes, 0, 0);
        
        // Calcular o horário mínimo permitido (agora + 2 horas)
        const minAllowedTime = new Date();
        minAllowedTime.setTime(minAllowedTime.getTime() + 2 * 60 * 60 * 1000);
        
        // Se o horário for inválido, ajustar para o mínimo permitido
        if (selectedTime < minAllowedTime) {
          const hours = minAllowedTime.getHours();
          const minutes = minAllowedTime.getMinutes();
          const minTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
          
          formik.setFieldValue('startTime', minTime);
          formik.setFieldValue('endTime', minTime);
          
          // Mostrar uma mensagem para o usuário sobre o ajuste automático
          // Usando setFieldError para exibir a mensagem abaixo do campo
          formik.setFieldError('startTime', `O horário foi ajustado para ${minTime} (mínimo de 2 horas após o horário atual)`);
          
          return;
        }
      }
    }
    
    formik.setFieldValue('startTime', newStartTime);
    formik.setFieldValue('endTime', newStartTime);
  };

  // Calcular o valor total do aluguel quando as datas, horários ou o veículo mudarem
  useEffect(() => {
    const { startDate, endDate, startTime, endTime, vehicleId } = formik.values;
    
    if (startDate && endDate && startTime && endTime && vehicleId && vehicleId > 0) {
      try {
        // Criar objetos de data combinando data e hora
      const start = combineDateAndTime(startDate, startTime);
      const end = combineDateAndTime(endDate, endTime);
      
      // Calcular a diferença em milissegundos
      const diffTime = Math.abs(end.getTime() - start.getTime());
        
        // Converter para dias, considerando horas parciais
        // 1000 ms * 60 s * 60 min * 24 h = 86400000 ms em um dia
        const days = diffTime / (1000 * 60 * 60 * 24);
        
        // Arredondar para cima para garantir que dias parciais sejam cobrados como dias completos
        const roundedDays = Math.ceil(days);
        
        if (roundedDays > 0) {
          // Buscar o veículo selecionado
          const selectedVehicle = (vehicles.data?.data || []).find((v: Vehicle) => v.id === vehicleId);
          
          if (selectedVehicle && selectedVehicle.dailyRate) {
            // Calcular o valor total
            const calculatedTotal = roundedDays * selectedVehicle.dailyRate;
            
            // Atualizar o estado e o formik
            setTotalAmount(calculatedTotal);
            formik.setFieldValue('totalAmount', calculatedTotal, true);
            formik.setFieldValue('vehicleDailyRate', selectedVehicle.dailyRate, true);
          }
        }
      } catch (error) {
        // Ignorar erros
      }
    }
  }, [formik.values, vehicles.data, formik.setFieldValue]);

  useEffect(() => {
    if (formikRef.current && initialValues) {
      formikRef.current.setValues({
        customerId: initialValues.customerId || '',
        vehicleId: initialValues.vehicleId || '',
        vehicleDailyRate: initialValues.vehicleDailyRate || 0,
        startDate: initialValues.startDate ? initialValues.startDate.substring(0, 10) : '',
        endDate: initialValues.endDate ? initialValues.endDate.substring(0, 10) : '',
        startTime: initialValues.startDate ? initialValues.startDate.substring(11, 16) : '',
        endTime: initialValues.endDate ? initialValues.endDate.substring(11, 16) : '',
        notes: initialValues.notes || '',
        totalAmount: initialValues.totalAmount || 0
      });
    }
  }, [initialValues]);

  // Calcular o totalAmount sempre que as datas ou veículo mudar
  useEffect(() => {
    if (formikRef.current) {
      const values = formikRef.current.values;
      const selectedVehicleId = values.vehicleId;
      
      // Procurar o veículo selecionado para obter a taxa diária
      // Acessar a estrutura correta dos dados de veículos
      let vehiclesData: any[] = [];
      if (vehicles.data?.data) {
        vehiclesData = vehicles.data.data;
      } else if (Array.isArray(vehicles.data)) {
        vehiclesData = vehicles.data;
      }
      
      // Garantir que a comparação de IDs seja feita corretamente (convertendo para mesmo tipo)
      const selectedVehicle = vehiclesData.find(v => String(v.id) === String(selectedVehicleId));
      
      if (selectedVehicle && values.startDate && values.endDate) {
        try {
          // Calcular diferença em dias
          const startDate = new Date(values.startDate);
          const endDate = new Date(values.endDate);
          
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Se for menos de 1 dia, considerar como 1 dia
            const days = Math.max(1, diffDays);
            
            // Calcular valor total
            const dailyRate = selectedVehicle.dailyRate || 0;
            const totalAmount = days * dailyRate;
            
            // Atualizar o valor no formulário
            formikRef.current.setFieldValue('totalAmount', totalAmount);
            formikRef.current.setFieldValue('vehicleDailyRate', dailyRate);
          }
        } catch (error) {
          // Ignorar erros
        }
      }
    }
  }, [formikRef.current?.values.startDate, formikRef.current?.values.endDate, formikRef.current?.values.vehicleId, vehicles]);

  // Garantir que os dados do formulário incluam todos os valores necessários
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Garantir que o totalAmount está atualizado corretamente
    if (!formik.values.totalAmount || formik.values.totalAmount <= 0) {
      formik.setFieldValue('totalAmount', totalAmount, false);
      // Atraso curto para garantir que o valor seja atualizado antes do submit
      setTimeout(() => {
        formik.handleSubmit();
      }, 100);
      return;
    }
    
    // Prosseguir com a submissão
    formik.handleSubmit(e as any);
  };

  // Quando o componente é montado ou quando o diálogo é aberto, verificar se a data inicial é hoje
  // e se o horário mínimo precisa ser exibido
  useEffect(() => {
    if (open) {
      const initialStartDate = formik.values.startDate;
      
      if (initialStartDate) {
        const selectedDate = new Date(initialStartDate);
        selectedDate.setHours(0, 0, 0, 0);
        
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        
        // Se for hoje, mostrar a mensagem do horário mínimo
        if (selectedDate.getTime() === todayDate.getTime()) {
          const minAllowedTime = getMinAllowedTime();
          const hours = minAllowedTime.getHours();
          const minutes = minAllowedTime.getMinutes();
          const minTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
          
          setMinTimeValue(minTime);
          setShowMinTimeMsg(true);
        } else {
          setShowMinTimeMsg(false);
        }
      }
    }
  }, [open, formik.values.startDate]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
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
                  {availableCustomers.length > 0 ? (
                    availableCustomers.map((customer: Customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.document}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value={-1} disabled>
                      Não há clientes disponíveis (todos estão com aluguéis em andamento)
                    </MenuItem>
                  )}
                </Select>
                {formik.touched.customerId && formik.errors.customerId && (
                  <Typography color="error" variant="caption">
                    {formik.errors.customerId}
                  </Typography>
                )}
                {availableCustomers.length === 0 && (
                  <Typography color="error" variant="caption">
                    Todos os clientes já possuem aluguéis em andamento
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
                  {availableVehicles.length > 0 ? (
                    availableVehicles.map((vehicle: Vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} ({vehicle.plate}) - {formatCurrency(vehicle.dailyRate)}/dia
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value={-1} disabled>
                      Não há veículos disponíveis para aluguel no momento
                    </MenuItem>
                  )}
                </Select>
                {formik.touched.vehicleId && formik.errors.vehicleId && (
                  <Typography color="error" variant="caption">
                    {formik.errors.vehicleId}
                  </Typography>
                )}
                {availableVehicles.length === 0 && (
                  <Typography color="error" variant="caption">
                    Não há veículos disponíveis para aluguel no momento
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
                helperText={formik.touched.startDate && formik.errors.startDate}
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
                  (showMinTimeMsg && `Mínimo: ${minTimeValue} (+2h)`)
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
                helperText={formik.touched.endDate && formik.errors.endDate}
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
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={availableCustomers.length === 0 || availableVehicles.length === 0}
          >
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 