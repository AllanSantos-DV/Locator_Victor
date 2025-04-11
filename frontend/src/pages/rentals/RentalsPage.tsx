import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useRentals } from '../../hooks/useRentals';
import { RentalList } from '../../components/rentals/RentalList';
import { RentalForm } from '../../components/rentals/RentalForm';
import { RentalDeleteDialog } from '../../components/rentals/RentalDeleteDialog';
import { Rental, RentalFormData, RentalStatus } from '../../types/rental';
import { Vehicle } from '../../types/vehicle';
import { Customer } from '../../types/customer';
import { useSnackbar } from 'notistack';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { RentalEarlyTerminationDialog } from '../../components/rentals/RentalEarlyTerminationDialog';
import { RentalExtendDialog } from '../../components/rentals/RentalExtendDialog';
import { api } from '../../services/api';
import { AxiosResponse } from 'axios';
import { rentalService } from '../../services/rentalService';
import { vehicleService } from '../../services/vehicleService';
import { customerService } from '../../services/customerService';
import { formatCurrency } from '../../utils/formatters';
import { useQueryClient } from '@tanstack/react-query';

// Atualizar a interface para garantir que totalAmount é obrigatório
interface CreateRentalRequest {
  customerId: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  status?: string;
  totalAmount: number;
}

// Função para verificar se uma data é hoje
const isToday = (date: Date): boolean => {
  const today = new Date();
  
  // Extrair apenas a data (sem hora)
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Comparar apenas os valores numéricos das datas
  return todayDate.getTime() === compareDate.getTime();
};

export const RentalsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  
  // Estados para os novos diálogos de confirmação
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Novo estado para controlar o diálogo de encerramento antecipado
  const [isEarlyTerminationDialogOpen, setIsEarlyTerminationDialogOpen] = useState(false);
  const [earlyTerminationDetails, setEarlyTerminationDetails] = useState({
    calculatedAmount: 0,
    terminationFee: 0,
    totalAmount: 0
  });

  // Novo estado para controle do diálogo de extensão
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);

  const {
    rentals,
    createRental,
    updateRental,
    startRental,
    completeRental,
    cancelRental,
    deleteRental,
    terminateRentalEarly,
    extendRental
  } = useRentals();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => Promise.resolve());
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rentalsResponse, vehiclesResponse, customersResponse] = await Promise.all([
        rentalService.findAll(),
        vehicleService.findAll(),
        customerService.findAll(),
      ]);

      // Atualizar os dados usando refetch() ao invés de setData
      await rentals.refetch();
      setVehicles(vehiclesResponse.data);
      setCustomers(customersResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      enqueueSnackbar('Erro ao carregar dados', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Método para fechar o modal de edição e resetar o estado
  const closeEditModal = () => {
    setIsFormOpen(false);
    setSelectedRental(null);
    enqueueSnackbar('Operação realizada com sucesso!', { variant: 'success' });
  };
  
  // Método para recarregar a lista de locações
  const loadRentals = async () => {
    try {
      await rentals.refetch();
    } catch (error) {
      enqueueSnackbar('Erro ao recarregar locações', { variant: 'error' });
    }
  };

  const handleAdd = () => {
    setSelectedRental(null);
    setIsFormOpen(true);
  };

  const handleEdit = (rental: Rental) => {
    setSelectedRental(rental);
    setIsFormOpen(true);
  };

  const handleDelete = (rental: Rental) => {
    setSelectedRental(rental);
    setIsDeleteDialogOpen(true);
  };

  // Handlers para abrir os diálogos de confirmação
  const handleStartConfirmation = async (rental: Rental): Promise<void> => {
    setSelectedRental(rental);
    setIsStartDialogOpen(true);
    return Promise.resolve();
  };

  const handleCompleteConfirmation = async (rental: Rental): Promise<void> => {
    setSelectedRental(rental);
    setIsCompleteDialogOpen(true);
    return Promise.resolve();
  };

  // Função para calcular os valores de encerramento antecipado
  const calculateEarlyTerminationDetails = (rental: Rental) => {
    // Isso é apenas uma simulação frontend para exibição
    // O cálculo real será feito no backend
    const startDate = new Date(rental.startDate);
    const today = new Date();
    const daysUsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) || 1;
    
    // Usar a diária fixa do veículo em vez de calcular
    const dailyRate = rental.vehicleDailyRate || (rental.vehicle?.dailyRate || 150);
    const calculatedAmount = dailyRate * daysUsed;
    const terminationFee = calculatedAmount * 0.1;
    const totalAmount = calculatedAmount + terminationFee;
    
    return {
      calculatedAmount,
      terminationFee,
      totalAmount
    };
  };
  
  // Modificar o método handleCancelConfirmation para verificar se o aluguel está em andamento
  const handleCancelConfirmation = async (rental: Rental): Promise<void> => {
    if (rental.status === RentalStatus.IN_PROGRESS) {
      const details = calculateEarlyTerminationDetails(rental);
      setEarlyTerminationDetails(details);
      setSelectedRental(rental);
      setIsEarlyTerminationDialogOpen(true);
    } else {
      setSelectedRental(rental);
      setIsCancelDialogOpen(true);
    }
    return Promise.resolve();
  };
  
  // Adicionar método para gerenciar o encerramento antecipado
  const handleEarlyTermination = async (): Promise<void> => {
    if (!selectedRental) return;
    
    try {
      await terminateRentalEarly.mutateAsync(selectedRental.id.toString());
      enqueueSnackbar('Aluguel encerrado antecipadamente com sucesso!', { variant: 'success' });
      setIsEarlyTerminationDialogOpen(false);
    } catch (error) {
      let errorMessage = 'Erro ao encerrar aluguel antecipadamente';
      if (error instanceof Error) {
        errorMessage += ': ' + error.message;
      }
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleStart = async () => {
    if (!selectedRental) return;
    
    try {
      await startRental.mutateAsync(selectedRental.id.toString());
      
      // Fechar o diálogo e limpar seleção
      setIsStartDialogOpen(false);
      setSelectedRental(null);
      
      // Mostrar mensagem de sucesso
      enqueueSnackbar('Aluguel iniciado com sucesso!', { variant: 'success' });
    } catch (error) {
      let errorMessage = 'Erro ao iniciar aluguel';
      if (error instanceof Error) {
        errorMessage += ': ' + error.message;
      }
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleComplete = async () => {
    if (!selectedRental) return;
    
    try {
      await completeRental.mutateAsync(selectedRental.id.toString());
      
      // Fechar o diálogo e limpar seleção
      setIsCompleteDialogOpen(false);
      setSelectedRental(null);
      
      // Mostrar mensagem de sucesso
      enqueueSnackbar('Aluguel finalizado com sucesso!', { variant: 'success' });
    } catch (error) {
      let errorMessage = 'Erro ao finalizar aluguel';
      if (error instanceof Error) {
        errorMessage += ': ' + error.message;
      }
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleCancel = async () => {
    if (!selectedRental) return;
    
    try {
      if (selectedRental.status !== RentalStatus.PENDING && selectedRental.status !== RentalStatus.IN_PROGRESS) {
        enqueueSnackbar('Apenas aluguéis pendentes ou em andamento podem ser cancelados', { variant: 'error' });
        return;
      }
      
      await cancelRental.mutateAsync(selectedRental.id.toString());
      
      // Fechar o diálogo e limpar seleção
      setIsCancelDialogOpen(false);
      setSelectedRental(null);
      
      // Mostrar mensagem de sucesso
      enqueueSnackbar('Aluguel cancelado com sucesso!', { variant: 'success' });
    } catch (error) {
      let errorMessage = 'Erro ao cancelar aluguel';
      if (error instanceof Error) {
        errorMessage += ': ' + error.message;
      }
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Função auxiliar para preparar os dados no formato esperado pelo backend
  const prepareBackendPayload = (formData: RentalFormData, selectedVehicle: Vehicle): any => {
    // Formatar as datas combinando data e hora
    const formattedStartDate = `${formData.startDate}T${formData.startTime}:00`;
    const formattedEndDate = `${formData.endDate}T${formData.endTime}:00`;
    
    // Obter o valor total e garantir que é maior que zero
    const totalAmount = formData.totalAmount && formData.totalAmount > 0 
      ? formData.totalAmount 
      : selectedVehicle.dailyRate * 2;
    
    console.log("Valor total calculado sendo enviado:", totalAmount);
    
    // Criar o payload no formato exato esperado pelo backend
    const payload = {
      customerId: Number(formData.customerId),
      vehicleId: Number(formData.vehicleId),
      vehiclePlate: selectedVehicle.plate,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      status: 'PENDING',
      totalAmount: totalAmount,
      notes: formData.notes || ''
    };
    
    console.log("Verificação do payload antes de enviar:", {
      placa: payload.vehiclePlate,
      valorTotal: payload.totalAmount
    });
    
    return payload;
  };

  const handleFormSubmit = async (data: RentalFormData, isEdit = false) => {
    console.log('handleFormSubmit chamado', new Date().toISOString());
    console.log('Dados recebidos do formulário:', data);
    console.log('Valor total recebido:', data.totalAmount);
    
    try {
      // Verifica se todos os campos obrigatórios estão presentes
      if (!data.vehicleId) {
        console.error('ID do veículo é obrigatório');
        enqueueSnackbar('É necessário selecionar um veículo', { variant: 'error' });
        return;
      }
      
      if (!data.customerId) {
        console.error('ID do cliente é obrigatório');
        enqueueSnackbar('É necessário selecionar um cliente', { variant: 'error' });
        return;
      }
      
      if (!data.startDate || !data.endDate || !data.startTime || !data.endTime) {
        console.error('Datas e horários de início e fim são obrigatórios');
        enqueueSnackbar('As datas e horários de início e fim são obrigatórios', { variant: 'error' });
        return;
      }
      
      // Verificar se totalAmount está definido e é maior que zero
      if (!data.totalAmount || data.totalAmount <= 0) {
        console.error('Valor total é obrigatório e deve ser maior que zero');
        enqueueSnackbar('O valor total da locação é obrigatório e deve ser maior que zero', { variant: 'error' });
        return;
      }
      
      // Encontra o veículo selecionado para obter a placa e dailyRate
      const vehicleId = typeof data.vehicleId === 'string' ? parseInt(data.vehicleId) : data.vehicleId;
      const selectedVehicle = vehicles.find(v => v.id === vehicleId);
      
      if (!selectedVehicle) {
        console.error(`Veículo com ID ${data.vehicleId} não encontrado`);
        enqueueSnackbar(`Erro: Veículo com ID ${data.vehicleId} não encontrado`, { variant: 'error' });
        return;
      }
      
      console.log('Veículo selecionado:', selectedVehicle);
      
      // Preparar os dados para o backend usando a função auxiliar
      const payload = prepareBackendPayload(data, selectedVehicle);
      console.log('Payload para o backend:', payload);
      
      if (isEdit && selectedRental?.id) {
        // Atualização de aluguel existente
        const updateData = {
          ...payload,
          id: selectedRental.id
        };
        console.log('Enviando atualização:', updateData);
        const response = await rentalService.update(selectedRental.id.toString(), updateData);
        console.log('Resposta do backend (atualização):', response);
        enqueueSnackbar('Aluguel atualizado com sucesso', { variant: 'success' });
      } else {
        // Criação de novo aluguel
        console.log('Enviando criação:', payload);
        const response = await rentalService.create(payload);
        console.log('Resposta do backend (criação):', response);
        
        // Força a invalidação das consultas relacionadas a veículos e aluguéis
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        queryClient.invalidateQueries({ queryKey: ['vehicles', 'available'] });
        queryClient.invalidateQueries({ queryKey: ['vehicles', data.vehicleId] });
        queryClient.refetchQueries({ queryKey: ['vehicles'], type: 'all' });
        
        enqueueSnackbar('Aluguel criado com sucesso', { variant: 'success' });
      }
      
      setIsFormOpen(false);
      setSelectedRental(null);
      
      // Garante que os dados sejam carregados novamente
      await loadData();
      
      // Força atualizações adicionais de cache
      queryClient.refetchQueries({ queryKey: ['vehicles'], type: 'all' });
      queryClient.refetchQueries({ queryKey: ['rentals'], type: 'all' });
    } catch (error: any) {
      console.error('Erro ao salvar aluguel:', error);
      console.error('Resposta de erro:', error.response?.data);
      enqueueSnackbar(`Erro ao salvar aluguel: ${error.response?.data?.message || error.message}`, { variant: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRental) return;

    try {
      switch (selectedRental.status) {
        case RentalStatus.PENDING:
          // Excluir aluguel pendente
          await deleteRental.mutateAsync(selectedRental.id.toString());
          enqueueSnackbar('Aluguel excluído com sucesso!', { variant: 'success' });
          break;

        case RentalStatus.IN_PROGRESS:
          // Cancelar aluguel em andamento
          await cancelRental.mutateAsync(selectedRental.id.toString());
          enqueueSnackbar('Aluguel cancelado com sucesso!', { variant: 'success' });
          break;

        case RentalStatus.COMPLETED:
        case RentalStatus.CANCELLED:
          // Excluir aluguel finalizado ou cancelado do histórico
          await deleteRental.mutateAsync(selectedRental.id.toString());
          enqueueSnackbar('Registro de aluguel excluído com sucesso!', { variant: 'success' });
          break;

        default:
          enqueueSnackbar('Status de aluguel inválido', { variant: 'error' });
          return;
      }
      setIsDeleteDialogOpen(false);
    } catch (error) {
      let errorMessage = 'Erro ao processar a operação';
      if (error instanceof Error) {
        errorMessage += ': ' + error.message;
      }
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Manipulador para abrir diálogo de extensão
  const handleExtendConfirmation = async (rental: Rental): Promise<void> => {
    setSelectedRental(rental);
    setIsExtendDialogOpen(true);
    return Promise.resolve();
  };
  
  // Manipulador para confirmar extensão
  const handleExtend = async (newEndDate: Date): Promise<void> => {
    if (!selectedRental) return;
    
    try {
      await extendRental.mutateAsync({ 
        id: selectedRental.id.toString(), 
        newEndDate 
      });
      enqueueSnackbar('Aluguel estendido com sucesso!', { variant: 'success' });
      setIsExtendDialogOpen(false);
    } catch (error) {
      let errorMessage = 'Erro ao estender aluguel';
      if (error instanceof Error) {
        errorMessage += ': ' + error.message;
      }
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Aluguéis</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Novo Aluguel
        </Button>
      </Box>

      <RentalList
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStart={handleStartConfirmation}
        onComplete={handleCompleteConfirmation}
        onCancel={handleCancelConfirmation}
        onExtend={handleExtendConfirmation}
      />

      <RentalForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialValues={selectedRental || undefined}
        title={selectedRental ? 'Editar Aluguel' : 'Novo Aluguel'}
      />

      <RentalDeleteDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        rental={selectedRental}
      />

      {/* Diálogo de confirmação para iniciar aluguel */}
      <ConfirmationDialog
        open={isStartDialogOpen}
        title="Iniciar Aluguel"
        message={`Tem certeza que deseja iniciar o aluguel do cliente ${selectedRental?.customerName || selectedRental?.customer?.name || 'N/A'}, para o veículo ${selectedRental?.vehicleBrand || selectedRental?.vehicle?.brand || ''} ${selectedRental?.vehicleModel || selectedRental?.vehicle?.model || ''} (Placa: ${selectedRental?.vehiclePlate || selectedRental?.vehicle?.plate || 'N/A'})? Esta ação marcará o veículo como indisponível.`}
        confirmText="Iniciar"
        confirmColor="primary"
        onConfirm={handleStart}
        onCancel={() => setIsStartDialogOpen(false)}
      />

      {/* Diálogo de confirmação para finalizar aluguel */}
      <ConfirmationDialog
        open={isCompleteDialogOpen}
        title="Finalizar Aluguel"
        message={`Tem certeza que deseja finalizar o aluguel do cliente ${selectedRental?.customerName || selectedRental?.customer?.name || 'N/A'}, para o veículo ${selectedRental?.vehicleBrand || selectedRental?.vehicle?.brand || ''} ${selectedRental?.vehicleModel || selectedRental?.vehicle?.model || ''} (Placa: ${selectedRental?.vehiclePlate || selectedRental?.vehicle?.plate || 'N/A'})? Esta ação marcará o veículo como disponível novamente.`}
        confirmText="Finalizar"
        confirmColor="success"
        onConfirm={handleComplete}
        onCancel={() => setIsCompleteDialogOpen(false)}
      />

      {/* Diálogo de confirmação para cancelar aluguel */}
      <ConfirmationDialog
        open={isCancelDialogOpen}
        title="Cancelar Aluguel"
        message={`Tem certeza que deseja cancelar o aluguel do cliente ${selectedRental?.customerName || selectedRental?.customer?.name || 'N/A'}, para o veículo ${selectedRental?.vehicleBrand || selectedRental?.vehicle?.brand || ''} ${selectedRental?.vehicleModel || selectedRental?.vehicle?.model || ''} (Placa: ${selectedRental?.vehiclePlate || selectedRental?.vehicle?.plate || 'N/A'})? Esta ação não pode ser desfeita.`}
        confirmText="Cancelar Aluguel"
        confirmColor="error"
        onConfirm={handleCancel}
        onCancel={() => setIsCancelDialogOpen(false)}
      />

      {/* Adicionar o novo diálogo de encerramento antecipado */}
      <RentalEarlyTerminationDialog
        open={isEarlyTerminationDialogOpen}
        onClose={() => setIsEarlyTerminationDialogOpen(false)}
        onConfirm={handleEarlyTermination}
        rental={selectedRental}
        calculatedAmount={earlyTerminationDetails.calculatedAmount}
        terminationFee={earlyTerminationDetails.terminationFee}
        totalAmount={earlyTerminationDetails.totalAmount}
      />

      {/* Adicionar o diálogo de extensão */}
      <RentalExtendDialog
        open={isExtendDialogOpen}
        onClose={() => setIsExtendDialogOpen(false)}
        onConfirm={handleExtend}
        rental={selectedRental}
      />
    </Box>
  );
}; 