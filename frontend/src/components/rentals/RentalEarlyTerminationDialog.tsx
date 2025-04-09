import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { Rental } from '../../types/rental';

interface RentalEarlyTerminationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  rental: Rental | null;
  calculatedAmount?: number;
  terminationFee?: number;
  totalAmount?: number;
}

export const RentalEarlyTerminationDialog: React.FC<RentalEarlyTerminationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  rental,
  calculatedAmount,
  terminationFee,
  totalAmount
}) => {
  if (!rental) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Encerramento Antecipado de Aluguel</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Você está encerrando antecipadamente o aluguel do cliente {rental.customerName || rental.customer?.name || 'N/A'} para o veículo {rental.vehicleBrand || rental.vehicle?.brand || ''} {rental.vehicleModel || rental.vehicle?.model || ''} ({rental.vehiclePlate || rental.vehicle?.plate || 'N/A'}).
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          De acordo com a política da empresa, será cobrada uma multa de 10% sobre o valor dos dias utilizados.
        </Typography>
        
        <Box mt={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            Detalhes do Cálculo:
          </Typography>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography>Valor pelos dias utilizados:</Typography>
            <Typography>R$ {calculatedAmount?.toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>Multa por encerramento antecipado (10%):</Typography>
            <Typography>R$ {terminationFee?.toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mt={1} fontWeight="bold">
            <Typography>Valor Total a Pagar:</Typography>
            <Typography>R$ {totalAmount?.toFixed(2)}</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          Confirmar Encerramento
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 