import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Stack
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface MetricsFilterProps {
  onFilterChange: (filters: Record<string, any>) => void;
  onReset: () => void;
  dateRange?: boolean;
  categoryFilter?: boolean;
  statusFilter?: boolean;
  vehicleFilter?: boolean;
  customerFilter?: boolean;
  periodFilter?: boolean;
  filters: Record<string, any>;
  categories?: string[];
  statuses?: string[];
}

export const MetricsFilter: React.FC<MetricsFilterProps> = ({
  onFilterChange,
  onReset,
  dateRange = true,
  categoryFilter = false,
  statusFilter = false,
  vehicleFilter = false,
  customerFilter = false,
  periodFilter = true,
  filters,
  categories = [],
  statuses = []
}) => {
  const handleChange = (field: string, value: any) => {
    onFilterChange({ ...filters, [field]: value });
  };
  
  const periodOptions = [
    { value: '7', label: 'Últimos 7 dias' },
    { value: '30', label: 'Últimos 30 dias' },
    { value: '90', label: 'Últimos 90 dias' },
    { value: '365', label: 'Último ano' },
    { value: 'custom', label: 'Personalizado' }
  ];
  
  return (
    <Paper 
      elevation={1}
      sx={{ 
        p: 2, 
        mb: 2,
        borderRadius: 1
      }}
    >
      <Grid container spacing={2} alignItems="flex-end">
        {periodFilter && (
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="period-select-label">Período</InputLabel>
              <Select
                labelId="period-select-label"
                id="period-select"
                label="Período"
                value={filters.period || '30'}
                onChange={(e) => handleChange('period', e.target.value)}
              >
                {periodOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        
        {dateRange && filters.period === 'custom' && (
          <>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <TextField
                id="start-date"
                label="Data Início"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <TextField
                id="end-date"
                label="Data Fim"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </Grid>
          </>
        )}
        
        {categoryFilter && categories.length > 0 && (
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-select-label">Categoria</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                label="Categoria"
                value={filters.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        
        {statusFilter && statuses.length > 0 && (
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status-select"
                label="Status"
                value={filters.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        
        <Grid item xs={12} sm={6} md={3} lg={2} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={onReset}
            startIcon={<RefreshIcon />}
          >
            Redefinir
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}; 