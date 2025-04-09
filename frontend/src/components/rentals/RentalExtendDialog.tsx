import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Typography,
  Box
} from '@mui/material';
import { Rental } from '../../types/rental';
import { formatCurrency } from '../../utils/formatters';

interface RentalExtendDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newEndDate: Date) => Promise<void>;
  rental: Rental | null;
}

export const RentalExtendDialog: React.FC<RentalExtendDialogProps> = ({
  open,
  onClose,
  onConfirm,
  rental
}) => {
  // Definir data mínima (atual data de fim + 1 dia)
  const getMinDate = (): string => {
    if (!rental) return '';
    
    const currentEndDate = new Date(rental.endDate);
    currentEndDate.setDate(currentEndDate.getDate() + 1);
    
    // Formatar como YYYY-MM-DD
    return currentEndDate.toISOString().split('T')[0];
  };
  
  // Definir data máxima (atual data de fim + 30 dias)
  const getMaxDate = (): string => {
    if (!rental) return '';
    
    const currentEndDate = new Date(rental.endDate);
    currentEndDate.setDate(currentEndDate.getDate() + 30);
    
    // Formatar como YYYY-MM-DD
    return currentEndDate.toISOString().split('T')[0];
  };

  // Estado para a nova data de fim
  const [newEndDate, setNewEndDate] = useState<string>(getMinDate());
  const [newEndTime, setNewEndTime] = useState<string>('18:00');
  
  // Calcular novo valor total estimado
  const calculateNewTotal = (): number => {
    if (!rental || !newEndDate) return 0;
    
    // Obter a data de início do aluguel
    const startDate = new Date(rental.startDate);
    
    // Obter a nova data de fim
    const endDateTime = new Date(`${newEndDate}T${newEndTime}`);
    
    // Calcular dias entre as datas
    const diffTime = Math.abs(endDateTime.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Usar a diária fixa do veículo (ou a dailyRate da locação, se disponível)
    const dailyRate = rental.vehicleDailyRate || (rental.vehicle?.dailyRate || 150);
    
    // Calcular novo total
    return dailyRate * diffDays;
  };

  // Manipulador para confirmar a extensão
  const handleConfirm = () => {
    if (!rental) return;
    
    // Criar objeto Date com a nova data e hora
    const dateTimeString = `${newEndDate}T${newEndTime}:00`;
    const newEndDateTime = new Date(dateTimeString);
    
    onConfirm(newEndDateTime);
  };
  
  // Resetar o estado quando o diálogo é aberto
  React.useEffect(() => {
    if (open) {
      setNewEndDate(getMinDate());
      setNewEndTime('18:00');
    }
  }, [open, rental]);

  if (!rental) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Estender Período de Aluguel</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Você está estendendo o aluguel do cliente {rental.customerName || rental.customer?.name || 'N/A'} para o veículo {rental.vehicleBrand || rental.vehicle?.brand || ''} {rental.vehicleModel || rental.vehicle?.model || ''} ({rental.vehiclePlate || rental.vehicle?.plate || 'N/A'}).
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Data de início original: {new Date(rental.startDate).toLocaleDateString()}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Data de término original: {new Date(rental.endDate).toLocaleDateString()}
        </Typography>
        
        <Box mt={3} mb={2}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Nova Data de Término
          </Typography>
          
          <TextField
            label="Data"
            type="date"
            fullWidth
            margin="dense"
            value={newEndDate}
            onChange={(e) => setNewEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: getMinDate(),
              max: getMaxDate()
            }}
          />
          
          <TextField
            label="Hora"
            type="time"
            fullWidth
            margin="dense"
            value={newEndTime}
            onChange={(e) => setNewEndTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        
        <Box mt={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Resumo
          </Typography>
          
          <Box display="flex" justifyContent="space-between">
            <Typography>Valor atual:</Typography>
            <Typography>{formatCurrency(rental.totalAmount)}</Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography>Novo valor estimado:</Typography>
            <Typography>{formatCurrency(calculateNewTotal())}</Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography fontWeight="bold">Diferença:</Typography>
            <Typography fontWeight="bold">{formatCurrency(calculateNewTotal() - rental.totalAmount)}</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button 
          onClick={handleConfirm} 
          color="primary" 
          variant="contained"
          disabled={!newEndDate}
        >
          Confirmar Extensão
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 