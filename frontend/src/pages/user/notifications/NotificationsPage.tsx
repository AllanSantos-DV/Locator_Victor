import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, Grid, Chip, Divider, CircularProgress, IconButton, Pagination } from '@mui/material';
import { DeleteOutline, MarkChatRead } from '@mui/icons-material';
import { Notification, notificationService } from '../../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationService.getUserNotifications(page, 10);
        setNotifications(response.content);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        toast.error('Não foi possível carregar suas notificações. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [page, refreshKey]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
      toast.success('Notificação marcada como lida');
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast.error('Não foi possível marcar a notificação como lida. Tente novamente.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setRefreshKey(prev => prev + 1);
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      toast.error('Não foi possível marcar todas notificações como lidas. Tente novamente.');
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
      toast.success('Notificação excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      toast.error('Não foi possível excluir a notificação. Tente novamente.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ptBR
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Suas Notificações
          </Typography>
          
          <Button 
            variant="outlined" 
            startIcon={<MarkChatRead />}
            onClick={handleMarkAllAsRead}
            disabled={loading || notifications.length === 0 || notifications.every(n => n.isRead)}
          >
            Marcar todas como lidas
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box py={5} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              Você não possui notificações.
            </Typography>
          </Box>
        ) : (
          <>
            {notifications.map((notification) => (
              <Paper
                key={notification.id}
                elevation={1}
                sx={{
                  p: 2,
                  mb: 2,
                  borderLeft: notification.isRead ? 'none' : '4px solid #1976d2',
                  bgcolor: notification.isRead ? 'inherit' : 'rgba(25, 118, 210, 0.05)'
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" component="h2">
                        {notification.title}
                      </Typography>
                      <Box>
                        {!notification.isRead && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleMarkAsRead(notification.id)}
                            title="Marcar como lida"
                            sx={{ mr: 1 }}
                          >
                            <MarkChatRead fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteNotification(notification.id)}
                          title="Excluir notificação"
                          color="error"
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body1">{notification.content}</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(notification.createdAt)}
                      </Typography>
                      
                      {!notification.isRead && (
                        <Chip 
                          label="Não lida" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination 
                  count={totalPages} 
                  page={page + 1} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationsPage; 