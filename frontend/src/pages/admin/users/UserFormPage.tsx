import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { api } from '../../../services/api';

// Interface para os dados do formulário
interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN' | '';
}

// Schema de validação
const validationSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().when('isNew', {
    is: true,
    then: (schema) => schema.min(8, 'A senha deve ter pelo menos 8 caracteres').required('Senha é obrigatória'),
    otherwise: (schema) => schema.min(8, 'A senha deve ter pelo menos 8 caracteres'),
  }),
  role: yup.string().required('Papel é obrigatório'),
});

export const UserFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id && id !== 'new');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Valores iniciais do formulário
  const initialValues: UserFormData = {
    name: '',
    email: '',
    password: '',
    role: '',
  };

  // Configuração do formik
  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema.concat(
      yup.object({
        isNew: yup.boolean().default(!isEditMode),
      })
    ),
    onSubmit: async (values) => {
      handleSubmit(values);
    },
  });

  // Carregar dados do usuário para edição
  useEffect(() => {
    const fetchUser = async () => {
      if (!isEditMode) return;
      
      try {
        setInitialLoading(true);
        const response = await api.get(`/admin/users/${id}`);
        const userData = response.data;
        
        formik.setValues({
          name: userData.name,
          email: userData.email,
          password: '', // Não exibimos a senha existente
          role: userData.role || 'USER', // Garantir que a role seja sempre definida
        });
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
        setError('Não foi possível carregar os dados do usuário.');
        
        // Redirecionar em caso de erro (provavelmente tentando acessar um admin)
        setTimeout(() => {
          navigate('/admin/users');
        }, 2000);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUser();
  }, [id, isEditMode]);

  // Enviar formulário
  const handleSubmit = async (values: UserFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Remover senha vazia ao editar
      const payload = {
        ...values,
        password: values.password.trim() ? values.password : undefined,
      };
      
      if (isEditMode) {
        await api.put(`/admin/users/${id}`, payload);
        setSnackbar({
          open: true,
          message: 'Usuário atualizado com sucesso!',
          severity: 'success',
        });
      } else {
        await api.post('/admin/users', values);
        setSnackbar({
          open: true,
          message: 'Usuário criado com sucesso!',
          severity: 'success',
        });
      }
      
      // Redirecionar após sucesso com pequeno delay
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setError(err.response?.data?.message || 'Erro ao salvar usuário.');
    } finally {
      setLoading(false);
    }
  };

  // Fechar snackbar
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Nome"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label={isEditMode ? "Nova senha (deixe em branco para manter a atual)" : "Senha"}
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Papel</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formik.values.role}
                  label="Papel"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.role && Boolean(formik.errors.role)}
                >
                  <MenuItem value="USER">Usuário</MenuItem>
                  <MenuItem value="ADMIN">Administrador</MenuItem>
                </Select>
                {formik.touched.role && formik.errors.role && (
                  <Typography color="error" variant="caption">
                    {formik.errors.role as string}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/users')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    isEditMode ? 'Salvar' : 'Criar'
                  )}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 