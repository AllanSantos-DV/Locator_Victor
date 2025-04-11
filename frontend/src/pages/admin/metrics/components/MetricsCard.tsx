import React, { ReactNode } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  useTheme,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { IconType } from 'react-icons';
import * as Icons from 'react-icons/fi';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<any>;
  description?: string;
  trend?: {
    value: number;
    isUpward: boolean;
    text: string;
  };
  color?: string;
  children?: ReactNode;
  sx?: any;
  onClick?: () => void;
  clickable?: boolean;
  selected?: boolean;
}

const StyledIconWrapper = styled(Box)<{ customcolor?: string }>(({ theme, customcolor = '#3182CE' }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: `${customcolor}20`,
  color: customcolor,
  width: '3rem',
  height: '3rem'
}));

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = '#3182CE',
  children,
  sx = {},
  onClick,
  clickable = false,
  selected = false
}) => {
  const theme = useTheme();
  
  return (
    <Tooltip title={clickable ? "Clique para filtrar o gráfico" : ""} arrow placement="top">
      <Paper
        elevation={selected ? 3 : 1}
        sx={{
          p: 3,
          borderRadius: 1,
          transition: 'all 0.3s',
          cursor: clickable ? 'pointer' : 'default',
          border: selected ? `2px solid ${color}` : 'none',
          '&:hover': {
            boxShadow: clickable ? 3 : 1,
            transform: clickable ? 'translateY(-2px)' : 'none'
          },
          ...sx
        }}
        onClick={clickable ? onClick : undefined}
      >
        <Grid container justifyContent="space-between" alignItems="flex-start">
          <Grid item>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
              <Typography variant="h5" fontWeight="bold" color={color}>
                {value}
              </Typography>
              {trend && (
                <Typography 
                  variant="body2" 
                  color={trend.isUpward ? 'success.main' : 'error.main'}
                >
                  {trend.isUpward ? '↑' : '↓'} {trend.value}% ({trend.text})
                </Typography>
              )}
              {description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {description}
                </Typography>
              )}
            </Stack>
          </Grid>
          
          {Icon && (
            <Grid item>
              <StyledIconWrapper customcolor={color}>
                <Icon size={24} />
              </StyledIconWrapper>
            </Grid>
          )}
        </Grid>
        
        {children && (
          <Box sx={{ mt: 2 }}>
            {children}
          </Box>
        )}
      </Paper>
    </Tooltip>
  );
}; 