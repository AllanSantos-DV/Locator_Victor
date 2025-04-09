import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  Typography
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { useCustomers } from '../../hooks/useCustomers';
import { Customer } from '../../types/customer';
import { useRentals } from '../../hooks/useRentals';
import { RentalStatus } from '../../types/rental';

interface CustomerListProps {
  onAdd: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ onAdd, onEdit, onDelete }) => {
  const { customers } = useCustomers();
  const { rentals } = useRentals();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredCustomers = (customers.data?.data || []).filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.document.includes(searchTerm) ||
      customer.phone.includes(searchTerm)
    );
  });

  const paginatedCustomers = filteredCustomers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Função para verificar se um cliente tem aluguéis pendentes ou em andamento
  const customerHasActiveRentals = (customerId: number): boolean => {
    if (!rentals.data?.data) return false;
    
    return rentals.data.data.some(
      rental => rental.customerId === customerId && 
      (rental.status === RentalStatus.PENDING || rental.status === RentalStatus.IN_PROGRESS)
    );
  };

  if (customers.isLoading) {
    return <Typography>Carregando clientes...</Typography>;
  }

  if (customers.isError) {
    return <Typography color="error">Erro ao carregar clientes. Tente novamente mais tarde.</Typography>;
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Clientes
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAdd}
          >
            Novo Cliente
          </Button>
        </Box>

        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="Buscar"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
            sx={{ flexGrow: 1 }}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Endereço</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCustomers.map((customer: Customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.document}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => onEdit(customer)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => onDelete(customer)}
                      size="small"
                      disabled={customerHasActiveRentals(customer.id)}
                      title={customerHasActiveRentals(customer.id) ? 
                        'Cliente possui aluguéis pendentes ou em andamento' : 
                        'Excluir cliente'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </CardContent>
    </Card>
  );
}; 