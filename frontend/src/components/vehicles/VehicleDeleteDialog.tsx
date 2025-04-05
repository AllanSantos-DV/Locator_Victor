import React, { useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Vehicle } from '../../types/vehicle';

interface VehicleDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  vehicle: Vehicle | null;
}

export const VehicleDeleteDialog: React.FC<VehicleDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  vehicle
}) => {
  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  if (!vehicle) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir o veículo {vehicle.brand} {vehicle.model} ({vehicle.plate})?
          Esta ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleConfirm} color="error" variant="contained">
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 