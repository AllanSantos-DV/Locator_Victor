import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, Avatar, Link, Grid, Alert, IconButton } from '@mui/material';
import { LockOutlined as LockIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface LocationState {
  message?: string;
}

export const Login: React.FC = () => {
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Verificar se há mensagem de rota anterior
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.message) {
      setSuccess(state.message);
    }
  }, [location]);
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    
    try {
      // Verificações de validação
      if (!email || !password) {
        setError('Preencha todos os campos');
        setIsLoading(false);
        return;
      }
      
      // Fazer login
      await signIn({
        email,
        password
      });
      
      // Forçar redirecionamento após login bem-sucedido
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Credenciais inválidas');
      } else {
        setError('Ocorreu um erro ao tentar fazer login');
      }
    } finally {
      setIsLoading(false);
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
          <LockIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
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
              <Link component={RouterLink} to="/register" variant="body2">
                {"Não tem uma conta? Cadastre-se"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}; 