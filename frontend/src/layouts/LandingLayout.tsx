import React from 'react';
import { Outlet } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '../theme';

export const LandingLayout: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Outlet />
    </ThemeProvider>
  );
}; 