import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useRentals } from '../../hooks/useRentals';
import { RentalList } from '../../components/rentals/RentalList';
import { RentalForm } from '../../components/rentals/RentalForm';
import { RentalDeleteDialog } from '../../components/rentals/RentalDeleteDialog';
import { Rental, RentalFormData, RentalStatus } from '../../types/rental';
import { useSnackbar } from 'notistack';

export const RentalsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);

  const {
    createRental,
    updateRental,
    startRental,
    completeRental,
    cancelRental,
    deleteRental
  } = useRentals();

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

  const handleStart = async (rental: Rental) => {
    try {
      await startRental.mutateAsync(rental.id.toString());
      enqueueSnackbar('Aluguel iniciado com sucesso!', { variant: 'success' });
    } catch (error) {
      let errorMessage = 'Erro ao iniciar aluguel';
      if (error instanceof Error) {
        errorMessage += ': ' + error.message;
      }
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleComplete = async (rental: Rental) => {
    try {
      await completeRental.mutateAsync(rental.id.toString());
      enqueueSnackbar('Aluguel finalizado com sucesso!', { variant: 'success' });
    } catch (error) {
      let errorMessage = 'Erro ao finalizar aluguel';
      if (error instanceof Error) {
        errorMessage += ': ' + error.message;
      }
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleCancel = async (rental: Rental) => {
    try {
      if (rental.status !== RentalStatus.PENDING && rental.status !== RentalStatus.IN_PROGRESS) {
        enqueueSnackbar('Apenas aluguéis pendentes ou em andamento podem ser cancelados', { variant: 'error' });
        return;
      }
      await cancelRental.mutateAsync(rental.id.toString());
      enqueueSnackbar('Aluguel cancelado com sucesso!', { variant: 'success' });
    } catch (error) {
      let errorMessage = 'Erro ao cancelar aluguel';
      if (error instanceof Error) {
        errorMessage += ': ' + error.message;
      }
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleFormSubmit = async (values: RentalFormData) => {
    try {
      // Formatar as datas para o formato LocalDateTime (YYYY-MM-DDThh:mm:ss) que o backend espera
      const formatToLocalDateTime = (dateStr: string, timeStr: string) => {
        // Verificar a validade da data antes de prosseguir
        if (!dateStr || !timeStr) {
          throw new Error('Data ou hora não fornecidos');
        }
        
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          throw new Error(`Formato de data inválido: ${dateStr}`);
        }
        
        if (!/^\d{2}:\d{2}$/.test(timeStr)) {
          throw new Error(`Formato de hora inválido: ${timeStr}`);
        }
        
        // Construir a string de data/hora diretamente, sem usar Date
        return `${dateStr}T${timeStr}:00`;
      };

      // Preparar os valores formatados para o backend
      const formattedValues = {
        ...values,
        // Formatar as datas com o tempo incluído conforme enviado pelo formulário
        startDate: formatToLocalDateTime(values.startDate, values.startTime),
        endDate: formatToLocalDateTime(values.endDate, values.endTime),
        // Definir o status como PENDING para novas locações
        status: selectedRental?.status || RentalStatus.PENDING,
        // Garantir que o totalAmount seja enviado como um número
        totalAmount: values.totalAmount || 0
      };

      if (selectedRental) {
        await updateRental.mutateAsync({ id: selectedRental.id, data: formattedValues });
        enqueueSnackbar('Aluguel atualizado com sucesso!', { variant: 'success' });
      } else {
        await createRental.mutateAsync(formattedValues);
        enqueueSnackbar('Aluguel criado com sucesso!', { variant: 'success' });
      }
      setIsFormOpen(false);
    } catch (error) {
      enqueueSnackbar('Erro ao salvar aluguel. Verifique os dados e tente novamente.', { variant: 'error' });
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
        onStart={handleStart}
        onComplete={handleComplete}
        onCancel={handleCancel}
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
    </Box>
  );
}; 