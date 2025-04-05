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
  if (!customer) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir o cliente {customer.name} ({customer.document})?
          Esta ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 