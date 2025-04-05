import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Rental, RentalStatus } from '../../types/rental';

interface RentalDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rental: Rental | null;
}

const getActionInfo = (rental: Rental | null) => {
  if (!rental) return { title: '', message: '', buttonText: '' };

  switch (rental.status) {
    case RentalStatus.PENDING:
      return {
        title: 'Excluir Aluguel',
        message: 'Tem certeza que deseja excluir este aluguel pendente?',
        buttonText: 'Excluir'
      };
    case RentalStatus.IN_PROGRESS:
      return {
        title: 'Cancelar Aluguel',
        message: 'Tem certeza que deseja cancelar este aluguel em andamento? Esta ação não pode ser desfeita.',
        buttonText: 'Cancelar'
      };
    case RentalStatus.COMPLETED:
    case RentalStatus.CANCELLED:
      return {
        title: 'Excluir Aluguel',
        message: 'Tem certeza que deseja excluir este aluguel? Esta ação não pode ser desfeita.',
        buttonText: 'Excluir'
      };
    default:
      return { title: '', message: '', buttonText: '' };
  }
};

export const RentalDeleteDialog: React.FC<RentalDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  rental
}) => {
  const { title, message, buttonText } = getActionInfo(rental);
  const isActionAllowed = rental?.status === RentalStatus.PENDING || 
                         rental?.status === RentalStatus.IN_PROGRESS ||
                         rental?.status === RentalStatus.COMPLETED ||
                         rental?.status === RentalStatus.CANCELLED;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Não
        </Button>
        <Button 
          onClick={onConfirm} 
          color={rental?.status === RentalStatus.IN_PROGRESS ? "error" : "primary"}
          disabled={!isActionAllowed}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 