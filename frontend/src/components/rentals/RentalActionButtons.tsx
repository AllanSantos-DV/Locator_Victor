import React from 'react';
import { Button, ButtonGroup, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Rental, RentalStatus } from '../../types/rental';

interface RentalActionButtonsProps {
  rental: Rental;
  onEdit: (rental: Rental) => void;
  onDelete: (rental: Rental) => void;
  onStart: (rental: Rental) => void;
  onComplete: (rental: Rental) => void;
  onCancel: (rental: Rental) => void;
}

export const RentalActionButtons: React.FC<RentalActionButtonsProps> = ({
  rental,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  onCancel
}) => {
  return (
    <ButtonGroup size="small">
      {rental.status === RentalStatus.PENDING && (
        <>
          <Tooltip title="Iniciar Aluguel">
            <Button
              color="primary"
              onClick={() => onStart(rental)}
              aria-label="iniciar aluguel"
            >
              <PlayArrowIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              color="primary"
              onClick={() => onEdit(rental)}
              aria-label="editar aluguel"
            >
              <EditIcon />
            </Button>
          </Tooltip>
        </>
      )}

      {rental.status === RentalStatus.IN_PROGRESS && (
        <Tooltip title="Finalizar Aluguel">
          <Button
            color="success"
            onClick={() => onComplete(rental)}
            aria-label="finalizar aluguel"
          >
            <CheckCircleIcon />
          </Button>
        </Tooltip>
      )}

      {(rental.status === RentalStatus.PENDING || rental.status === RentalStatus.IN_PROGRESS) && (
        <Tooltip title="Cancelar Aluguel">
          <Button
            color="error"
            onClick={() => onCancel(rental)}
            aria-label="cancelar aluguel"
          >
            <CancelIcon />
          </Button>
        </Tooltip>
      )}

      {(rental.status === RentalStatus.COMPLETED || rental.status === RentalStatus.CANCELLED) && (
        <Tooltip title="Excluir do Histórico">
          <Button
            color="error"
            onClick={() => onDelete(rental)}
            aria-label="excluir aluguel"
          >
            <DeleteIcon />
          </Button>
        </Tooltip>
      )}
    </ButtonGroup>
  );
}; 