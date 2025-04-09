import React, { Fragment } from 'react';
import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Pagination,
  Stack,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  People as PeopleIcon,
  LocalShipping as RentalIcon,
} from '@mui/icons-material';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Função para garantir que as datas sejam formatadas corretamente
const formatDate = (dateString: string): Date => {
  // Verifica se a data já tem o formato ISO completo ou apenas data
  // Se for apenas YYYY-MM-DD, adiciona a hora (T00:00:00)
  if (dateString && dateString.length === 10) {
    return new Date(`${dateString}T00:00:00`);
  }
  return new Date(dateString);
};

interface RecentRental {
  id: number;
  clientName: string;
  vehicleModel: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface RecentRentalsPage {
  content: RecentRental[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

interface DashboardData {
  totalVehicles: number;
  availableVehicles: number;
  totalClients: number;
  activeRentals: number;
  recentRentals: RecentRentalsPage;
}

// Definir um tipo para as cores do Chip
type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('@CarRent:token');
        
        if (!token) {
          setError('Sem token de autenticação. Faça login novamente.');
          setLoading(false);
          return;
        }
        
        try {
          const response = await api.get(`/dashboard?page=${page - 1}&size=10`);
          setData(response.data);
          setLoading(false);
        } catch (apiError) {
          try {
            const headers = new Headers({
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            });
            
            const fetchResponse = await fetch(`${api.defaults.baseURL}/dashboard?page=${page - 1}&size=10`, {
              method: 'GET',
              headers
            });
            
            if (!fetchResponse.ok) {
              const errorText = await fetchResponse.text();
              throw new Error(`Falha na requisição fetch: ${fetchResponse.status} ${fetchResponse.statusText}. ${errorText}`);
            }
            
            const fetchData = await fetchResponse.json();
            setData(fetchData);
            setLoading(false);
          } catch (fetchError) {
            setError('Falha ao carregar dados do dashboard. Tente novamente mais tarde.');
            setLoading(false);
          }
        }
      } catch (error) {
        setError('Ocorreu um erro ao carregar os dados do dashboard.');
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getRentalStatusColor = (status: string): ChipColor => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatRentalStatus = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'PENDING':
        return 'Pendente';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Nenhum dado disponível</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bem-vindo, {user?.name ? user.name.split(' ')[0] : 'Usuário'}!
      </Typography>

      <Grid container spacing={3}>
        {/* Cards de Resumo */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CarIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Veículos</Typography>
              </Box>
              <Typography variant="h4">{data.totalVehicles}</Typography>
              <Typography color="textSecondary">
                {data.availableVehicles} disponíveis
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Clientes</Typography>
              </Box>
              <Typography variant="h4">{data.totalClients}</Typography>
              <Typography color="textSecondary">Total cadastrados</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <RentalIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Locações Ativas</Typography>
              </Box>
              <Typography variant="h4">{data.activeRentals}</Typography>
              <Typography color="textSecondary">Em andamento</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Locações Recentes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RentalIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Locações Recentes</Typography>
              </Box>
              <List>
                {data.recentRentals.content.map((rental, index) => (
                  <Fragment key={rental.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1">
                              {rental.clientName} - {rental.vehicleModel}
                            </Typography>
                            <Chip
                              label={formatRentalStatus(rental.status)}
                              color={getRentalStatusColor(rental.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="textSecondary">
                            {formatDate(rental.startDate).toLocaleDateString('pt-BR')} até {formatDate(rental.endDate).toLocaleDateString('pt-BR')}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </Fragment>
                ))}
              </List>
              {data.recentRentals.totalPages > 1 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={data.recentRentals.totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
