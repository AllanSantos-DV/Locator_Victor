import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type ChartType = 'line' | 'bar' | 'doughnut';

interface MetricsChartProps {
  title: string;
  description?: string;
  chartType: ChartType;
  data: ChartData<any>;
  options?: ChartOptions<any>;
  height?: number;
  sx?: any;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  title,
  description,
  chartType,
  data,
  options,
  height = 300,
  sx = {}
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const defaultOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          },
          color: isDarkMode ? '#CBD5E0' : '#4A5568',
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        titleColor: isDarkMode ? '#1A202C' : '#FFFFFF',
        bodyColor: isDarkMode ? '#1A202C' : '#FFFFFF',
        footerColor: isDarkMode ? '#1A202C' : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      }
    },
    scales: chartType !== 'doughnut' ? {
      x: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: isDarkMode ? '#CBD5E0' : '#4A5568'
        }
      },
      y: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: isDarkMode ? '#CBD5E0' : '#4A5568'
        }
      }
    } : undefined
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  const renderChart = () => {
    switch(chartType) {
      case 'line':
        return <Line data={data} options={mergedOptions} height={height} />;
      case 'bar':
        return <Bar data={data} options={mergedOptions} height={height} />;
      case 'doughnut':
        return <Doughnut data={data} options={mergedOptions} height={height} />;
      default:
        return <Line data={data} options={mergedOptions} height={height} />;
    }
  };
  
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        borderRadius: 1,
        height: 'auto',
        ...sx
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      
      <Box sx={{ height: `${height}px`, width: '100%' }}>
        {renderChart()}
      </Box>
    </Paper>
  );
}; 