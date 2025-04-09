import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Customer } from '../../types/customer';
import { useRentals } from '../../hooks/useRentals';
import { RentalStatus } from '../../types/rental';

interface CustomerDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customer: Customer | null;
}

export const CustomerDeleteDialog: React.FC<CustomerDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  customer
}) => {
  const { rentals } = useRentals();
  
  if (!customer) return null;
  
  // Verificar se o cliente tem aluguéis ativos
  const hasActiveRentals = (): boolean => {
    if (!rentals.data?.data) return false;
    
    return rentals.data.data.some(
      rental => rental.customerId === customer.id && 
      (rental.status === RentalStatus.PENDING || rental.status === RentalStatus.IN_PROGRESS)
    );
  };
  
  const canDelete = !hasActiveRentals();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent>
        {canDelete ? (
          <DialogContentText>
            Tem certeza que deseja excluir o cliente {customer.name} ({customer.document})?
            Esta ação não pode ser desfeita.
          </DialogContentText>
        ) : (
          <DialogContentText color="error">
            Não é possível excluir o cliente {customer.name} ({customer.document}) porque ele possui aluguéis pendentes ou em andamento.
            Cancele ou finalize todos os aluguéis antes de excluir o cliente.
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={!canDelete}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 