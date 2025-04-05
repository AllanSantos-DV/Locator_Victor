import React, { useState } from 'react';
import { Box, Container, Snackbar, Alert } from '@mui/material';
import { VehicleList } from '../../components/vehicles/VehicleList';
import { VehicleForm } from '../../components/vehicles/VehicleForm';
import { VehicleDeleteDialog } from '../../components/vehicles/VehicleDeleteDialog';
import { useVehicles } from '../../hooks/useVehicles';
import { Vehicle, VehicleFormData } from '../../types/vehicle';

export const VehiclePage: React.FC = () => {
  const { createVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleAdd = () => {
    setSelectedVehicle(null);
    setFormOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormOpen(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (values: VehicleFormData) => {
    try {
      if (selectedVehicle) {
        await updateVehicle.mutateAsync({ id: selectedVehicle.id, data: values });
        setSnackbar({
          open: true,
          message: 'Veículo atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        await createVehicle.mutateAsync(values);
        setSnackbar({
          open: true,
          message: 'Veículo criado com sucesso!',
          severity: 'success'
        });
      }
      setFormOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao salvar veículo. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVehicle) return;

    try {
      await deleteVehicle.mutateAsync(selectedVehicle.id);
      setSnackbar({
        open: true,
        message: 'Veículo excluído com sucesso!',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao excluir veículo. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <VehicleList
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <VehicleForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialValues={selectedVehicle || undefined}
          title={selectedVehicle ? 'Editar Veículo' : 'Novo Veículo'}
        />

        <VehicleDeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          vehicle={selectedVehicle}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}; 