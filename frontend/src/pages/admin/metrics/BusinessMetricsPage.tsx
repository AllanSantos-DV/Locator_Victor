import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Chip,
  Paper,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Tabs, Tab } from '@mui/material';
import { MetricsCard } from './components/MetricsCard';
import { MetricsChart } from './components/MetricsChart';
import { MetricsFilter } from './components/MetricsFilter';
import { metricsService, BusinessMetricsDTO } from '../../../services/metricsService';
import { 
  FiDollarSign, FiTruck, FiUsers, FiCalendar, 
  FiBarChart2, FiPieChart, FiTrendingUp 
} from 'react-icons/fi';
import { ChartData } from 'chart.js';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';

interface FilterState {
  period: string;
  startDate: string;
  endDate: string;
  category: string;
  status: string;
}

// Adicionar estado para filtro de status no gráfico
interface ChartFilterState {
  showAll: boolean;
  showActive: boolean;
  showCompleted: boolean;
  showCancelled: boolean;
  showDaily: boolean; // Para alternar entre visualização diária e mensal
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`metrics-tabpanel-${index}`}
      aria-labelledby={`metrics-tab-${index}`}
      {...other}
      style={{ paddingTop: 24 }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

const BusinessMetricsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<BusinessMetricsDTO | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    period: '30',
    startDate: '',
    endDate: '',
    category: '',
    status: ''
  });
  const [tabValue, setTabValue] = useState(0);
  
  // Novo estado para filtros do gráfico
  const [chartFilters, setChartFilters] = useState<ChartFilterState>({
    showAll: true,
    showActive: false,
    showCompleted: false,
    showCancelled: false,
    showDaily: false
  });

  // Adicionar novo estado para o card selecionado
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleFilterChange = (newFilters: Record<string, any>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters
    };
    setFilters(updatedFilters);
    
    // Chamar fetchMetrics com os novos filtros
    fetchMetricsWithFilters(updatedFilters);
  };

  // Função para buscar métricas com filtros
  const fetchMetricsWithFilters = async (filterParams: FilterState) => {
    try {
      setLoading(true);
      // Preparar os parâmetros de consulta com base nos filtros
      const params: Record<string, string> = {};
      
      if (filterParams.period === 'custom' && filterParams.startDate && filterParams.endDate) {
        params.startDate = filterParams.startDate;
        params.endDate = filterParams.endDate;
      } else if (filterParams.period !== 'custom') {
        // Usar o período selecionado (7, 30, 90, 365 dias)
        params.days = filterParams.period;
      }
      
      if (filterParams.category) {
        params.category = filterParams.category;
      }
      
      if (filterParams.status) {
        params.status = filterParams.status;
      }
      
      const data = await metricsService.getBusinessMetricsWithFilters(params);
      setMetrics(data);
    } catch (error) {
      toast.error('Não foi possível carregar as métricas de negócio.');
      console.error('Error fetching business metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      // Use filtros atuais, se disponíveis
      if (filters.period) {
        fetchMetricsWithFilters(filters);
        return;
      }
      
      const data = await metricsService.getBusinessMetrics();
      setMetrics(data);
    } catch (error) {
      toast.error('Não foi possível carregar as métricas de negócio.');
      console.error('Error fetching business metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterReset = () => {
    const defaultFilters = {
      period: '30',
      startDate: '',
      endDate: '',
      category: '',
      status: ''
    };
    setFilters(defaultFilters);
    // Chamar fetchMetrics com os filtros padrão
    fetchMetricsWithFilters(defaultFilters);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Função para alternar entre visão diária e mensal
  const handleViewTypeChange = (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
    if (newView !== null) {
      setChartFilters({
        ...chartFilters,
        showDaily: newView === 'daily'
      });
    }
  };
  
  // Função para alternar os filtros de status
  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    
    if (name === 'showAll') {
      // Se 'Todos' for selecionado, desativa os outros filtros
      setChartFilters({
        ...chartFilters,
        showAll: checked,
        showActive: false,
        showCompleted: false,
        showCancelled: false
      });
    } else {
      // Se um filtro específico for selecionado, desativa 'Todos'
      setChartFilters({
        ...chartFilters,
        [name]: checked,
        showAll: false
      });
      
      // Se nenhum filtro específico estiver ativo, reativa 'Todos'
      const updatedFilters = {
        ...chartFilters,
        [name]: checked,
        showAll: false
      };
      
      if (!updatedFilters.showActive && !updatedFilters.showCompleted && !updatedFilters.showCancelled) {
        updatedFilters.showAll = true;
      }
      
      setChartFilters(updatedFilters);
    }
  };

  // Função para lidar com o clique nos cards
  const handleCardClick = (cardType: string) => {
    // Se já está selecionado, desseleciona
    if (selectedCard === cardType) {
      setSelectedCard(null);
      
      // Resetar filtros para mostrar todos
      setChartFilters({
        ...chartFilters,
        showAll: true,
        showActive: false,
        showCompleted: false,
        showCancelled: false
      });
    } else {
      setSelectedCard(cardType);
      
      // Atualizar filtros com base no card selecionado
      switch (cardType) {
        case 'all':
          setChartFilters({
            ...chartFilters,
            showAll: true,
            showActive: false,
            showCompleted: false,
            showCancelled: false
          });
          break;
        case 'active':
          setChartFilters({
            ...chartFilters,
            showAll: false,
            showActive: true,
            showCompleted: false,
            showCancelled: false
          });
          break;
        case 'completed':
          setChartFilters({
            ...chartFilters,
            showAll: false,
            showActive: false,
            showCompleted: true,
            showCancelled: false
          });
          break;
        case 'cancelled':
          setChartFilters({
            ...chartFilters,
            showAll: false,
            showActive: false,
            showCompleted: false,
            showCancelled: true
          });
          break;
      }
    }
  };

  // Preparar dados para gráfico de aluguéis por mês/dia
  const prepareRentalsByMonthData = (): ChartData<'line'> => {
    if (!metrics?.rentalMetrics) {
      return {
        labels: [],
        datasets: [{
          label: 'Aluguéis por Mês',
          data: [],
          borderColor: '#3182CE',
          backgroundColor: 'rgba(49, 130, 206, 0.2)',
        }]
      };
    }

    // Obter dados de rentals - usando any para contornar o erro temporariamente
    const metricsData = metrics.rentalMetrics as any;
    const rentalsByMonth = metricsData.rentalsByMonth || {};
    const rentals = metricsData.rentals || [];
    
    // Inicializar arrays de datasets
    const datasets = [];
    
    // Determinar labels e dados baseados no modo de visualização
    let labels: string[] = [];
    let allRentalsData: number[] = [];
    let activeRentalsData: number[] = [];
    let completedRentalsData: number[] = [];
    let cancelledRentalsData: number[] = [];
    
    if (chartFilters.showDaily && rentals.length > 0) {
      // Visualização diária
      // Determinar o período com base no filtro selecionado
      let startDate, endDate;
      
      if (filters.period === 'custom' && filters.startDate && filters.endDate) {
        startDate = new Date(filters.startDate);
        endDate = new Date(filters.endDate);
      } else {
        const days = parseInt(filters.period || '30');
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
      }
      
      // Gerar todas as datas do período
      const dateLabels: string[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        dateLabels.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      labels = dateLabels.map(date => {
        const [year, month, day] = date.split('-');
        return `${day}/${month}`;
      });
      
      // Inicializar arrays com zeros para todas as datas
      allRentalsData = new Array(dateLabels.length).fill(0);
      activeRentalsData = new Array(dateLabels.length).fill(0);
      completedRentalsData = new Array(dateLabels.length).fill(0);
      cancelledRentalsData = new Array(dateLabels.length).fill(0);
      
      // Calcular número cumulativo de aluguéis por dia
      let totalAll = 0;
      let totalActive = 0;
      let totalCompleted = 0;
      let totalCancelled = 0;
      
      // Ordenar aluguéis por data
      const sortedRentals = [...rentals].sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      
      dateLabels.forEach((date, index) => {
        // Contar novos aluguéis nesta data
        const dateRentals = sortedRentals.filter(r => 
          r.startDate.split('T')[0] === date
        );
        
        totalAll += dateRentals.length;
        totalActive += dateRentals.filter(r => r.status === 'IN_PROGRESS').length;
        totalCompleted += dateRentals.filter(r => r.status === 'COMPLETED').length;
        totalCancelled += dateRentals.filter(r => r.status === 'CANCELLED').length;
        
        allRentalsData[index] = totalAll;
        activeRentalsData[index] = totalActive;
        completedRentalsData[index] = totalCompleted;
        cancelledRentalsData[index] = totalCancelled;
      });
    } else {
      // Visualização mensal
      // Garantir que temos todos os meses no período selecionado
      const allMonths: string[] = [];
      
      // Determinar o período com base no filtro selecionado
      if (filters.period === 'custom' && filters.startDate && filters.endDate) {
        // Para período personalizado, usar as datas fornecidas
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        const currentDate = new Date(startDate);
        
        // Adicionar todos os meses entre startDate e endDate
        while (currentDate <= endDate) {
          const year = currentDate.getFullYear();
          // Mês é zero-indexado em JavaScript, então adicionar 1
          const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
          allMonths.push(`${year}-${month}`);
          
          // Avançar para o próximo mês
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      } else {
        // Para períodos predefinidos (7, 30, 90, 365 dias)
        const days = parseInt(filters.period || '30');
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        // Adicionar todos os meses entre startDate e endDate
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const year = currentDate.getFullYear();
          const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
          allMonths.push(`${year}-${month}`);
          
          // Avançar para o próximo mês
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }
      
      // Garantir que não temos meses duplicados e ordenar
      const uniqueMonths = [...new Set(allMonths)].sort();
      
      // Usar os meses disponíveis ou todos os meses do período se não houver dados
      const monthsToShow = uniqueMonths.length > 0 ? uniqueMonths : Object.keys(rentalsByMonth).sort();
      
      labels = monthsToShow.map(month => {
        const [year, monthNum] = month.split('-');
        return `${monthNum}/${year}`;
      });
      
      // Preparar dados para cada tipo de status
      const rentalsByStatus = metricsData.rentalsByMonthAndStatus || {};
      
      // Todos os aluguéis
      allRentalsData = monthsToShow.map(month => rentalsByMonth[month] || 0);
      
      // Aluguéis ativos
      activeRentalsData = monthsToShow.map(month => 
        rentalsByStatus['IN_PROGRESS']?.[month] || 0
      );
      
      // Aluguéis concluídos
      completedRentalsData = monthsToShow.map(month => 
        rentalsByStatus['COMPLETED']?.[month] || 0
      );
      
      // Aluguéis cancelados
      cancelledRentalsData = monthsToShow.map(month => 
        rentalsByStatus['CANCELLED']?.[month] || 0
      );
    }
    
    // Construir datasets baseados nos filtros ativos
    if (chartFilters.showAll) {
      datasets.push({
        label: 'Todos os Aluguéis',
        data: allRentalsData,
        borderColor: '#3182CE',
        backgroundColor: 'rgba(49, 130, 206, 0.2)',
        tension: 0.3,
        fill: true
      });
    }
    
    if (chartFilters.showActive) {
      datasets.push({
        label: 'Aluguéis Ativos',
        data: activeRentalsData,
        borderColor: '#38A169',
        backgroundColor: 'rgba(56, 161, 105, 0.2)',
        tension: 0.3,
        fill: true
      });
    }
    
    if (chartFilters.showCompleted) {
      datasets.push({
        label: 'Aluguéis Concluídos',
        data: completedRentalsData,
        borderColor: '#319795',
        backgroundColor: 'rgba(49, 151, 149, 0.2)',
        tension: 0.3,
        fill: true
      });
    }
    
    if (chartFilters.showCancelled) {
      datasets.push({
        label: 'Aluguéis Cancelados',
        data: cancelledRentalsData,
        borderColor: '#E53E3E',
        backgroundColor: 'rgba(229, 62, 62, 0.2)',
        tension: 0.3,
        fill: true
      });
    }
    
    // Se nenhum dataset estiver presente, mostrar todos os aluguéis
    if (datasets.length === 0) {
      datasets.push({
        label: 'Todos os Aluguéis',
        data: allRentalsData,
        borderColor: '#3182CE',
        backgroundColor: 'rgba(49, 130, 206, 0.2)',
        tension: 0.3,
        fill: true
      });
    }
    
    return {
      labels,
      datasets
    };
  };

  // Preparar dados para gráfico de veículos por categoria
  const prepareVehiclesByCategoryData = (): ChartData<'doughnut'> => {
    if (!metrics?.vehicleMetrics.vehiclesByCategory) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderWidth: 1
        }]
      };
    }

    const vehiclesByCategory = metrics.vehicleMetrics.vehiclesByCategory;
    const categories = Object.keys(vehiclesByCategory);
    
    // Cores para o gráfico
    const backgroundColors = [
      'rgba(49, 130, 206, 0.7)',  // Azul
      'rgba(154, 230, 180, 0.7)',  // Verde
      'rgba(237, 137, 54, 0.7)',   // Laranja
      'rgba(113, 128, 150, 0.7)',  // Cinza
      'rgba(255, 99, 132, 0.7)',   // Vermelho
      'rgba(255, 206, 86, 0.7)',   // Amarelo
    ];
    
    return {
      labels: categories,
      datasets: [{
        data: categories.map(category => vehiclesByCategory[category]),
        backgroundColor: categories.map((_, index) => backgroundColors[index % backgroundColors.length]),
        borderWidth: 1
      }]
    };
  };

  // Preparar dados para gráfico de descontos por tipo
  const prepareDiscountsByTypeData = (): ChartData<'bar'> => {
    if (!metrics?.discountMetrics.discountsByType) {
      return {
        labels: [],
        datasets: [{
          label: 'Descontos por Tipo',
          data: [],
          backgroundColor: 'rgba(49, 130, 206, 0.7)',
        }]
      };
    }

    const discountsByType = metrics.discountMetrics.discountsByType;
    const discountTypes = Object.keys(discountsByType);
    
    // Cores para o gráfico
    const backgroundColors = [
      'rgba(49, 130, 206, 0.7)',   // Azul
      'rgba(154, 230, 180, 0.7)',  // Verde
      'rgba(237, 137, 54, 0.7)',   // Laranja
      'rgba(113, 128, 150, 0.7)',  // Cinza
    ];
    
    return {
      labels: discountTypes,
      datasets: [{
        label: 'Descontos por Tipo',
        data: discountTypes.map(type => discountsByType[type]),
        backgroundColor: discountTypes.map((_, index) => backgroundColors[index % backgroundColors.length]),
      }]
    };
  };

  // Modificar a seção de renderização do gráfico de aluguéis
  const renderRentalsChart = () => {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 1, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Aluguéis por Período</Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ToggleButtonGroup
              value={chartFilters.showDaily ? 'daily' : 'monthly'}
              exclusive
              onChange={handleViewTypeChange}
              aria-label="chart view type"
              size="small"
              sx={{ mr: 2 }}
            >
              <ToggleButton value="monthly" aria-label="monthly view">
                Mensal
              </ToggleButton>
              <ToggleButton value="daily" aria-label="daily view">
                Diário
              </ToggleButton>
            </ToggleButtonGroup>
            
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={chartFilters.showAll} 
                    onChange={handleStatusFilterChange} 
                    name="showAll"
                    color="primary"
                    size="small"
                  />
                }
                label="Todos"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={chartFilters.showActive} 
                    onChange={handleStatusFilterChange} 
                    name="showActive"
                    color="success"
                    size="small"
                  />
                }
                label="Ativos"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={chartFilters.showCompleted} 
                    onChange={handleStatusFilterChange} 
                    name="showCompleted"
                    color="info"
                    size="small"
                  />
                }
                label="Concluídos"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={chartFilters.showCancelled} 
                    onChange={handleStatusFilterChange} 
                    name="showCancelled"
                    color="error"
                    size="small"
                  />
                }
                label="Cancelados"
              />
            </FormGroup>
          </Box>
        </Box>
        
        <Box sx={{ height: 300, width: '100%' }}>
          <Line 
            data={prepareRentalsByMonthData()} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                }
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: chartFilters.showDaily ? 'Dia' : 'Mês'
                  }
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Número de Aluguéis'
                  }
                }
              }
            }}
          />
        </Box>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Container>
        <Typography variant="h5" color="error" textAlign="center" mt={4}>
          Erro ao carregar métricas. Por favor, tente novamente mais tarde.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ my: 4 }}>
        Métricas de Negócio
      </Typography>
      
      <MetricsFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
        dateRange={true}
        periodFilter={true}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <MetricsCard
            title="Aluguéis Totais"
            value={metrics.rentalMetrics.totalRentals}
            icon={FiCalendar as React.ComponentType<any>}
            color="#3182CE"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricsCard
            title="Veículos Disponíveis"
            value={metrics.vehicleMetrics.availableVehicles}
            icon={FiTruck as React.ComponentType<any>}
            color="#38A169"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricsCard
            title="Total de Descontos"
            value={metrics.discountMetrics.totalDiscountsApplied}
            icon={FiDollarSign as React.ComponentType<any>}
            color="#805AD5"
          />
        </Grid>
      </Grid>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="business metrics tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Aluguéis" id="metrics-tab-0" aria-controls="metrics-tabpanel-0" />
            <Tab label="Veículos" id="metrics-tab-1" aria-controls="metrics-tabpanel-1" />
            <Tab label="Descontos" id="metrics-tab-2" aria-controls="metrics-tabpanel-2" />
          </Tabs>
        </Box>

        {/* Painel de Aluguéis */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricsCard
                title="Total de Aluguéis"
                value={metrics.rentalMetrics.totalRentals}
                icon={FiCalendar as React.ComponentType<any>}
                color="#3182CE"
                clickable={true}
                selected={selectedCard === 'all'}
                onClick={() => handleCardClick('all')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricsCard
                title="Aluguéis Ativos"
                value={metrics.rentalMetrics.activeRentals}
                icon={FiTrendingUp as React.ComponentType<any>}
                color="#38A169"
                clickable={true}
                selected={selectedCard === 'active'}
                onClick={() => handleCardClick('active')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricsCard
                title="Aluguéis Concluídos"
                value={metrics.rentalMetrics.completedRentals}
                icon={FiCalendar as React.ComponentType<any>}
                color="#319795"
                clickable={true}
                selected={selectedCard === 'completed'}
                onClick={() => handleCardClick('completed')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricsCard
                title="Aluguéis Cancelados"
                value={metrics.rentalMetrics.cancelledRentals}
                icon={FiCalendar as React.ComponentType<any>}
                color="#E53E3E"
                clickable={true}
                selected={selectedCard === 'cancelled'}
                onClick={() => handleCardClick('cancelled')}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              {renderRentalsChart()}
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Top Clientes
                </Typography>
                
                {metrics.rentalMetrics.topCustomers.map((customer, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 1, 
                    p: 1, 
                    bgcolor: 'background.paper', 
                    borderRadius: 1 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={`#${index + 1}`} 
                        size="small" 
                        color="primary" 
                        sx={{ mr: 1 }} 
                      />
                      <Typography variant="body2">
                        {customer.customerName}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {customer.rentalCount} aluguéis
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Painel de Veículos */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <MetricsCard
                title="Total de Veículos"
                value={metrics.vehicleMetrics.totalVehicles}
                icon={FiTruck as React.ComponentType<any>}
                color="#3182CE"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricsCard
                title="Veículos Disponíveis"
                value={metrics.vehicleMetrics.availableVehicles}
                icon={FiTruck as React.ComponentType<any>}
                color="#38A169"
                description={`${((metrics.vehicleMetrics.availableVehicles / metrics.vehicleMetrics.totalVehicles) * 100).toFixed(1)}% da frota`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricsCard
                title="Taxa de Utilização"
                value={`${metrics.vehicleMetrics.averageUtilizationRate.toFixed(1)}%`}
                icon={FiBarChart2 as React.ComponentType<any>}
                color="#805AD5"
                description="Média da taxa de utilização dos veículos"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <MetricsChart
                title="Veículos por Categoria"
                chartType="doughnut"
                data={prepareVehiclesByCategoryData()}
                height={300}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Top 5 Veículos Mais Alugados
                </Typography>
                {metrics.vehicleMetrics.mostRentedVehicles.map((vehicle, index) => (
                  <Box key={vehicle.vehicleId} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 1, 
                    p: 1, 
                    borderRadius: 1, 
                    bgcolor: 'background.paper' 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={`#${index + 1}`}
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" fontWeight="medium">
                        {vehicle.vehicleBrand} {vehicle.vehicleModel}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                        {vehicle.rentalCount} aluguéis
                      </Typography>
                      <Chip
                        label={`${vehicle.utilizationRate.toFixed(1)}% utilização`}
                        size="small"
                        color="success"
                      />
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Painel de Descontos */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <MetricsCard
                title="Total de Descontos"
                value={metrics.discountMetrics.totalDiscountsApplied}
                icon={FiDollarSign as React.ComponentType<any>}
                color="#3182CE"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricsCard
                title="Valor Total de Descontos"
                value={`R$ ${metrics.discountMetrics.totalDiscountAmount.toFixed(2)}`}
                icon={FiDollarSign as React.ComponentType<any>}
                color="#38A169"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricsCard
                title="Desconto Médio"
                value={`${metrics.discountMetrics.averageDiscountPercentage}%`}
                icon={FiDollarSign as React.ComponentType<any>}
                color="#E53E3E"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <MetricsChart
                title="Descontos por Tipo"
                chartType="bar"
                data={prepareDiscountsByTypeData()}
                height={300}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Distribuição de Descontos
                </Typography>
                {metrics.discountMetrics.discountDistribution.map((distribution) => (
                  <Box key={distribution.discountRange} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 1, 
                    p: 1, 
                    borderRadius: 1, 
                    bgcolor: 'background.paper' 
                  }}>
                    <Typography variant="body2" fontWeight="medium">
                      {distribution.discountRange}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                        {distribution.count} aluguéis
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        R$ {distribution.totalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  );
};

export { BusinessMetricsPage }; 