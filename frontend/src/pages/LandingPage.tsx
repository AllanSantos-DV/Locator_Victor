import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Container, Grid, Paper, useTheme, alpha } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import bgImage from '../assets/images/car-rental-bg.png';
import { AccountCircle, VpnKey, DirectionsCar, Speed, Security, Support } from '@mui/icons-material';
import { getEnv } from '../utils/env';

// Animações
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Componentes estilizados
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#333',
  backgroundImage: `linear-gradient(to bottom, ${alpha('#000000', 0.4)}, ${alpha('#000000', 0.6)}), url(${bgImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(4),
  color: '#fff',
  textAlign: 'center'
}));

const AnimatedBox = styled(Box)`
  animation: ${fadeIn} 1s ease-out;
`;

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1.5, 4),
  borderRadius: 50,
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  '&:hover': {
    animation: `${pulse} 1s infinite`
  }
}));

// Componente principal
export const LandingPage = () => {
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);

  // Efeito para animação ao carregar
  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Seção Hero com call-to-action */}
      <HeroSection>
        <Container maxWidth="md">
          <AnimatedBox style={{ opacity: loaded ? 1 : 0 }}>
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
              Sistema de Gerenciamento de Locação
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 5 }}>
              Gerencie frotas, clientes e reservas de forma eficiente e segura.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <ActionButton
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AccountCircle />}
                onClick={() => window.location.href = '/login'}
              >
                Login
              </ActionButton>
              <ActionButton
                variant="outlined"
                size="large"
                startIcon={<VpnKey />}
                onClick={() => window.location.href = '/register'}
                sx={{ 
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: theme.palette.primary.light,
                    color: theme.palette.primary.light,
                    bgcolor: alpha('#ffffff', 0.1)
                  }
                }}
              >
                Registro
              </ActionButton>
            </Box>
          </AnimatedBox>
        </Container>
      </HeroSection>

      {/* Seção de Recursos */}
      <Box sx={{ py: 8, px: 2 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
            Recursos Poderosos
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                title: 'Gerenciamento de Frota',
                description: 'Cadastre, monitore e gerencie todos os veículos da sua frota.',
                icon: <DirectionsCar fontSize="large" color="primary" />
              },
              {
                title: 'Controle Eficiente',
                description: 'Acompanhe locações ativas, histórico e previsões de disponibilidade.',
                icon: <Speed fontSize="large" color="primary" />
              },
              {
                title: 'Segurança Avançada',
                description: 'Controle de acesso por perfis e proteção de dados com criptografia.',
                icon: <Security fontSize="large" color="primary" />
              },
              {
                title: 'Suporte Técnico',
                description: 'Suporte técnico especializado para ajudar em qualquer necessidade.',
                icon: <Support fontSize="large" color="primary" />
              }
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <AnimatedBox sx={{ 
                  animationDelay: `${index * 0.2}s`,
                  opacity: loaded ? 1 : 0
                }}>
                  <FeatureCard elevation={3}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom align="center">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="textSecondary" align="center">
                      {feature.description}
                    </Typography>
                  </FeatureCard>
                </AnimatedBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Rodapé */}
      <Box sx={{ 
        bgcolor: theme.palette.primary.main, 
        color: 'white', 
        py: 3,
        textAlign: 'center'
      }}>
        <Container>
          <Typography variant="body1">
            &copy; {new Date().getFullYear()} {getEnv('REACT_APP_COMPANY_NAME', 'Car Rental Management')}. Todos os direitos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}; 