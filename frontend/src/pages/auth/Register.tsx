import { useState, FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Alert,
  IconButton,
  Container
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { api } from '../../services/api';
import axios from 'axios';

// Interface para tipagem dos erros da API
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ApiError {
  message: string;
  code: string;
  status: number;
}

export const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!name || !email || !password || !confirmPassword) {
      setError('Preencha todos os campos');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      setLoading(false);
      return;
    }
    
    try {
      // Enviar dados para o servidor
      await api.post('/auth/register', { name, email, password });
      
      // Redirecionar para o login em caso de sucesso
      setLoading(false);
      navigate('/login', { state: { message: 'Cadastro realizado com sucesso! Faça login para continuar.' } });
    } catch (err) {
      setLoading(false);
      
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Erro ao realizar cadastro');
      } else {
        setError('Ocorreu um erro ao processar o cadastro');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          width: '100%'
        }}
      >
        {/* Botão Voltar */}
        <Box sx={{ position: 'absolute', top: 0, left: 0 }}>
          <IconButton 
            color="primary"
            onClick={() => navigate('/')}
            aria-label="voltar para página inicial"
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>

        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <PersonAddIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Cadastro
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Nome"
            name="name"
            autoComplete="name"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            type="email"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="new-password"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirmar Senha"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Button
                variant="text"
                color="primary"
                onClick={() => navigate('/')}
                startIcon={<ArrowBackIcon />}
                size="small"
              >
                Voltar
              </Button>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                {"Já tem uma conta? Faça login"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}; 