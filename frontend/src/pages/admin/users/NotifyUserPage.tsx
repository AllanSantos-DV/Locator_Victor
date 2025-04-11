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

// Interface para o formulário de notificação
interface NotificationFormData {
  title: string;
  content: string;
  type: 'SYSTEM';
}

// Schema de validação
const validationSchema = yup.object({
  title: yup.string().required('Título é obrigatório'),
  content: yup.string().required('Conteúdo é obrigatório'),
});

export const NotifyUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number, name: string, email: string } | null>(null);
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
  const initialValues: NotificationFormData = {
    title: '',
    content: '',
    type: 'SYSTEM',
  };

  // Configuração do formik
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      handleSubmit(values);
    },
  });

  // Carregar dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setInitialLoading(true);
        const response = await api.get(`/admin/users/${id}`);
        setUser(response.data);
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
        setError('Não foi possível carregar os dados do usuário.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Enviar notificação
  const handleSubmit = async (values: NotificationFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post(`/admin/users/${id}/notify`, values);
      
      setSnackbar({
        open: true,
        message: 'Notificação enviada com sucesso!',
        severity: 'success',
      });
      
      // Redirecionar após sucesso com pequeno delay
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao enviar notificação:', err);
      setError(err.response?.data?.message || 'Erro ao enviar notificação.');
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
          Enviar Notificação
        </Typography>
        
        {user && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Destinatário: {user.name} ({user.email})
          </Typography>
        )}
        
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
                id="title"
                name="title"
                label="Título"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="content"
                name="content"
                label="Conteúdo"
                multiline
                rows={4}
                value={formik.values.content}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.content && Boolean(formik.errors.content)}
                helperText={formik.touched.content && formik.errors.content}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Tipo de Notificação: Sistema
              </Typography>
              <input type="hidden" name="type" value="SYSTEM" />
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
                    'Enviar Notificação'
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
} 