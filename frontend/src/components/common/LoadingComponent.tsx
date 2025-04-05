import React from 'react';
import { CircularProgress, Box } from '@mui/material';

export const LoadingComponent: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px'
    }}
  >
    <CircularProgress />
  </Box>
); 