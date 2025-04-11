import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Notifications as NotifyIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';

// Tipo para usuário
type User = {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
};

export const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Carregar lista de usuários
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/users/all');
        setUsers(response.data);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
        setError('Não foi possível carregar a lista de usuários.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Abrir diálogo de confirmação para excluir usuário
  const handleDeleteClick = (user: User) => {
    // Não permitir exclusão de administradores
    if (user.role === 'ADMIN') {
      setSnackbar({
        open: true,
        message: 'Não é permitido excluir usuários administradores',
        severity: 'error',
      });
      return;
    }
    
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Fechar diálogo de confirmação
  const handleDialogClose = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Excluir usuário
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      
      // Atualizar lista removendo o usuário excluído
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      setSnackbar({
        open: true,
        message: 'Usuário excluído com sucesso!',
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erro ao excluir usuário. Não é possível excluir administradores.',
        severity: 'error',
      });
    } finally {
      handleDialogClose();
    }
  };

  // Navegar para a página de edição do usuário
  const handleEditClick = (id: number, role: string) => {
    // Não permitir edição de administradores
    if (role === 'ADMIN') {
      setSnackbar({
        open: true,
        message: 'Não é permitido editar usuários administradores',
        severity: 'error',
      });
      return;
    }
    
    navigate(`/admin/users/${id}/edit`);
  };

  // Navegar para a página de notificação do usuário
  const handleNotifyClick = (id: number) => {
    navigate(`/admin/users/${id}/notify`);
  };

  // Fechar snackbar
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gerenciamento de Usuários
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/users/new')}
        >
          Novo Usuário
        </Button>
      </Stack>

      {loading ? (
        <Typography>Carregando...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Papel</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.id}
                  sx={user.role === 'ADMIN' ? { backgroundColor: 'rgba(0, 0, 0, 0.04)' } : {}}
                >
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    {user.name}
                    {user.role === 'ADMIN' && (
                      <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                        (Admin)
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(user.id, user.role)}
                      title={user.role === 'ADMIN' ? "Não é permitido editar administradores" : "Editar"}
                      disabled={user.role === 'ADMIN'}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(user)}
                      title={user.role === 'ADMIN' ? "Não é permitido excluir administradores" : "Excluir"}
                      disabled={user.role === 'ADMIN'}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      color="info"
                      onClick={() => handleNotifyClick(user.id)}
                      title="Notificar"
                    >
                      <NotifyIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o usuário {userToDelete?.name}? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 