import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Vehicle, VehicleCategory, VehicleStatus } from '../../types/vehicle';
import { useQuery } from '@tanstack/react-query';
import { vehicleService } from '../../services/vehicleService';
import { ApiResponse } from '../../types/common';

interface VehicleListProps {
  onAdd: () => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({ onAdd, onEdit, onDelete }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [categoryFilter, setCategoryFilter] = useState<VehicleCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');

  const { data: vehiclesResponse, isLoading } = useQuery<ApiResponse<Vehicle[]>>({
    queryKey: ['vehicles'],
    queryFn: vehicleService.findAll,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  }, []);

  const handleStatusFilterChange = useCallback((event: SelectChangeEvent<VehicleStatus | 'all'>) => {
    setStatusFilter(event.target.value as VehicleStatus | 'all');
    setPage(0);
  }, []);

  const getCategoryColor = useCallback((category: VehicleCategory) => {
    switch (category) {
      case VehicleCategory.STANDARD:
        return 'primary';
      case VehicleCategory.LUXURY:
        return 'secondary';
      case VehicleCategory.SUV:
        return 'info';
      case VehicleCategory.SPORTS:
        return 'warning';
      default:
        return 'default';
    }
  }, []);

  const translateStatus = (status: VehicleStatus): string => {
    const statusMap: Record<VehicleStatus, string> = {
      [VehicleStatus.AVAILABLE]: 'Disponível',
      [VehicleStatus.RENTED]: 'Alugado',
      [VehicleStatus.RESERVED]: 'Reservado',
      [VehicleStatus.MAINTENANCE]: 'Em Manutenção'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: VehicleStatus): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    switch (status) {
      case VehicleStatus.AVAILABLE:
        return 'success';
      case VehicleStatus.RENTED:
        return 'error';
      case VehicleStatus.RESERVED:
        return 'info';
      case VehicleStatus.MAINTENANCE:
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehiclesResponse?.data?.filter(vehicle => {
      const matchesSearch =
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || vehicle.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' || vehicle.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    }) || [];
  }, [vehiclesResponse?.data, searchTerm, categoryFilter, statusFilter]);

  // Ordenar veículos com os disponíveis primeiro
  const sortedVehicles = useMemo(() => {
    return [...filteredVehicles].sort((a, b) => {
      // Primeiro critério: status (disponível primeiro)
      if (a.status === VehicleStatus.AVAILABLE && b.status !== VehicleStatus.AVAILABLE) return -1;
      if (a.status !== VehicleStatus.AVAILABLE && b.status === VehicleStatus.AVAILABLE) return 1;
      
      // Segundo critério: se ambos têm o mesmo status, ordenar por marca e modelo
      return a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model);
    });
  }, [filteredVehicles]);

  const paginatedVehicles = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedVehicles.slice(start, start + rowsPerPage);
  }, [sortedVehicles, page, rowsPerPage]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Carregando veículos...</Typography>
      </Box>
    );
  }

  if (!vehiclesResponse || vehiclesResponse.error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography color="error">Erro ao carregar veículos: {vehiclesResponse?.error?.message}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Veículos</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Novo Veículo
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar veículos..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value={VehicleStatus.AVAILABLE}>Disponível</MenuItem>
                  <MenuItem value={VehicleStatus.RENTED}>Alugado</MenuItem>
                  <MenuItem value={VehicleStatus.RESERVED}>Reservado</MenuItem>
                  <MenuItem value={VehicleStatus.MAINTENANCE}>Em Manutenção</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Placa</TableCell>
                  <TableCell>Marca</TableCell>
                  <TableCell>Modelo</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedVehicles.map(vehicle => (
                  <TableRow key={vehicle.id}>
                    <TableCell>{vehicle.plate}</TableCell>
                    <TableCell>{vehicle.brand}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>
                      <Chip
                        label={vehicle.category}
                        color={getCategoryColor(vehicle.category)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={translateStatus(vehicle.status)}
                        color={getStatusColor(vehicle.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(vehicle)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(vehicle)}
                        color="error"
                        disabled={vehicle.status !== VehicleStatus.AVAILABLE}
                        title={vehicle.status !== VehicleStatus.AVAILABLE ? 'Apenas veículos disponíveis podem ser excluídos' : 'Excluir veículo'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredVehicles.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Itens por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </CardContent>
      </Card>
    </Box>
  );
}; 