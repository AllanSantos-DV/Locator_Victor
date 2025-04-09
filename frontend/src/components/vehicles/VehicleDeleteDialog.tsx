import React, { useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Vehicle, VehicleStatus } from '../../types/vehicle';

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
  
  const isAvailable = vehicle.status === VehicleStatus.AVAILABLE;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent>
        {isAvailable ? (
          <DialogContentText>
            Tem certeza que deseja excluir o veículo {vehicle.brand} {vehicle.model} ({vehicle.plate})?
            Esta ação não pode ser desfeita.
          </DialogContentText>
        ) : (
          <DialogContentText color="error">
            Não é possível excluir o veículo {vehicle.brand} {vehicle.model} ({vehicle.plate}) porque ele não está disponível.
            Apenas veículos com status DISPONÍVEL podem ser excluídos.
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={handleConfirm} 
          color="error" 
          variant="contained"
          disabled={!isAvailable}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 