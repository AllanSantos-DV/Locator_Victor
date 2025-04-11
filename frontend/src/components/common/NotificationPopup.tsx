import React, { useEffect, useState } from 'react';
import { Alert, Snackbar, Typography, Box, IconButton, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MarkunreadIcon from '@mui/icons-material/Markunread';
import { Notification, notificationService } from '../../services/notificationService';

interface NotificationPopupProps {
  onMarkAsRead: (id: number) => void;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({ onMarkAsRead }) => {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);
  const [queue, setQueue] = useState<Notification[]>([]);

  useEffect(() => {
    // Buscar notificações não lidas quando o componente montar
    const fetchUnreadNotifications = async () => {
      try {
        const response = await notificationService.getUserNotifications(0, 10);
        // Filtrar apenas notificações não lidas
        const unreadNotifications = response.content.filter(notification => !notification.isRead);
        
        if (unreadNotifications.length > 0) {
          setQueue(unreadNotifications);
        }
      } catch (error) {
        console.error('Erro ao buscar notificações não lidas:', error);
      }
    };

    fetchUnreadNotifications();
  }, []);

  // Mostrar próxima notificação da fila quando o componente montar ou quando a fila mudar
  useEffect(() => {
    if (queue.length > 0 && !open) {
      // Pegar a primeira notificação da fila
      const nextNotification = queue[0];
      setCurrentNotification(nextNotification);
      setOpen(true);
      
      // Remover a notificação da fila
      setQueue(prevQueue => prevQueue.slice(1));
    }
  }, [queue, open]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleMarkAsRead = () => {
    if (currentNotification) {
      onMarkAsRead(currentNotification.id);
      handleClose();
    }
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        severity="info" 
        variant="filled"
        sx={{ width: '100%', maxWidth: 400 }}
        action={
          <Stack direction="row">
            <IconButton
              size="small"
              color="inherit"
              onClick={handleMarkAsRead}
              title="Marcar como lida"
            >
              <MarkunreadIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="inherit"
              onClick={handleClose}
              title="Fechar"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        }
      >
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            {currentNotification.title}
          </Typography>
          <Typography variant="body2">
            {currentNotification.content}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
}; 