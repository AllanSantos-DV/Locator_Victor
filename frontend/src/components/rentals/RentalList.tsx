import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Chip,
  Tooltip,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Stop as CompleteIcon,
  Cancel as CancelIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { useRentals } from '../../hooks/useRentals';
import { Rental, RentalStatus } from '../../types/rental';
import { formatCurrency } from '../../utils/formatters';

interface RentalListProps {
  onAdd?: () => void;
  onEdit: (rental: Rental) => void;
  onDelete: (rental: Rental) => void;
  onStart: (rental: Rental) => void;
  onComplete: (rental: Rental) => void;
  onCancel: (rental: Rental) => void;
  onExtend: (rental: Rental) => void;
}

export const RentalList: React.FC<RentalListProps> = ({
  onAdd,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  onCancel,
  onExtend
}) => {
  const { rentals } = useRentals();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RentalStatus | ''>('');

  const filteredRentals = rentals.data?.data?.filter((rental: Rental) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      rental.customer?.name?.toLowerCase().includes(searchLower) ||
      rental.vehicle?.plate?.toLowerCase().includes(searchLower) ||
      rental.status.toLowerCase().includes(searchLower);

    const matchesStatus = !statusFilter || rental.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: RentalStatus) => {
    switch (status) {
      case RentalStatus.PENDING:
        return 'Pendente';
      case RentalStatus.IN_PROGRESS:
        return 'Em Andamento';
      case RentalStatus.COMPLETED:
        return 'Concluído';
      case RentalStatus.CANCELLED:
        return 'Cancelado';
      case RentalStatus.EARLY_TERMINATED:
        return 'Encerrado Antecipadamente';
      default:
        return status;
    }
  };

  const renderCancelButton = (rental: Rental) => {
    if (rental.status === RentalStatus.IN_PROGRESS) {
      return (
        <Tooltip title="Encerrar Antecipadamente">
          <IconButton 
            color="error" 
            onClick={() => onCancel(rental)}
          >
            <CancelIcon />
          </IconButton>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title="Cancelar Aluguel">
          <IconButton 
            color="error" 
            onClick={() => onCancel(rental)}
            disabled={rental.status !== RentalStatus.PENDING}
          >
            <CancelIcon />
          </IconButton>
        </Tooltip>
      );
    }
  };

  const renderActionButtons = (rental: Rental) => {
    switch (rental.status) {
      case 'PENDING':
        return (
          <>
            <Tooltip title="Editar">
              <IconButton
                onClick={() => onEdit(rental)}
                color="primary"
                size="small"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Iniciar Aluguel">
              <IconButton
                onClick={() => onStart(rental)}
                color="success"
                size="small"
              >
                <StartIcon />
              </IconButton>
            </Tooltip>
            {renderCancelButton(rental)}
          </>
        );
      case 'IN_PROGRESS':
        return (
          <>
            <Tooltip title="Finalizar Aluguel">
              <IconButton
                onClick={() => onComplete(rental)}
                color="success"
                size="small"
              >
                <CompleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Estender Aluguel">
              <IconButton
                onClick={() => onExtend(rental)}
                color="primary"
                size="small"
              >
                <UpdateIcon />
              </IconButton>
            </Tooltip>
            {renderCancelButton(rental)}
          </>
        );
      default:
        return (
          <Typography variant="caption" color="textSecondary">
            Sem ações disponíveis
          </Typography>
        );
    }
  };

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Aluguéis
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAdd}
          >
            Novo Aluguel
          </Button>
        </Box>

        <Card>
          <CardContent>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Buscar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por cliente, placa ou status..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as RentalStatus | '')}
                    label="Status"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="PENDING">Pendente</MenuItem>
                    <MenuItem value="IN_PROGRESS">Em Andamento</MenuItem>
                    <MenuItem value="COMPLETED">Concluído</MenuItem>
                    <MenuItem value="CANCELLED">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Veículo</TableCell>
                    <TableCell>Data Início</TableCell>
                    <TableCell>Data Fim</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Valor Total</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRentals?.map((rental: Rental) => (
                    <TableRow key={rental.id}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {rental.customer?.name || rental.customerName || "Cliente não especificado"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1">
                            {rental.vehicleBrand && rental.vehicleModel 
                              ? `${rental.vehicleBrand} ${rental.vehicleModel}`
                              : rental.vehicle 
                                ? `${rental.vehicle.brand} ${rental.vehicle.model}`
                                : 'Veículo não especificado'}
                          </Typography>
                          <Chip 
                            label={rental.vehiclePlate || (rental.vehicle?.plate || 'Sem placa')} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(rental.startDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{new Date(rental.endDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(rental.status)}
                          color={
                            rental.status === 'PENDING' ? 'warning' : 
                            rental.status === 'IN_PROGRESS' ? 'info' : 
                            rental.status === 'COMPLETED' ? 'success' : 
                            'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(rental.totalAmount)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {renderActionButtons(rental)}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}; 