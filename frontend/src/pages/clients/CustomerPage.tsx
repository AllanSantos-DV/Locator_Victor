import React, { useState } from 'react';
import { Box, Container, Snackbar, Alert } from '@mui/material';
import { CustomerList } from '../../components/clients/CustomerList';
import { CustomerForm } from '../../components/clients/CustomerForm';
import { CustomerDeleteDialog } from '../../components/clients/CustomerDeleteDialog';
import { useCustomers } from '../../hooks/useCustomers';
import { Customer, CustomerFormData } from '../../types/customer';
import { useSnackbar } from 'notistack';

export const CustomerPage: React.FC = () => {
  const { createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    setSelectedCustomer(null);
    setFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (values: CustomerFormData) => {
    try {
      if (selectedCustomer) {
        await updateCustomer.mutateAsync({ id: selectedCustomer.id, data: values });
        enqueueSnackbar('Cliente atualizado com sucesso!', { variant: 'success' });
      } else {
        await createCustomer.mutateAsync(values);
        enqueueSnackbar('Cliente criado com sucesso!', { variant: 'success' });
      }
      setFormOpen(false);
    } catch (error) {
      enqueueSnackbar('Erro ao salvar cliente. Verifique os dados e tente novamente.', { variant: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;

    try {
      await deleteCustomer.mutateAsync(selectedCustomer.id);
      setSnackbar({
        open: true,
        message: 'Cliente excluído com sucesso!',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      // Verificar se é o erro específico de cliente com aluguéis ativos
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage.includes('aluguéis pendentes') || errorMessage.includes('em andamento')) {
        setSnackbar({
          open: true,
          message: 'Não é possível excluir cliente com aluguéis pendentes ou em andamento',
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Erro ao excluir cliente: ${errorMessage || 'Tente novamente.'}`,
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <CustomerList
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <CustomerForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialValues={selectedCustomer || undefined}
          title={selectedCustomer ? 'Editar Cliente' : 'Novo Cliente'}
        />

        <CustomerDeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          customer={selectedCustomer}
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