import React, { useState, useEffect } from 'react';
import { 
  Badge, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography, 
  Box, 
  Divider, 
  Button,
  CircularProgress,
  ListItemText
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  MarkChatRead as MarkChatReadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Notification, notificationService } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationsMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const open = Boolean(anchorEl);
  
  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações não lidas:', error);
    }
  };
  
  useEffect(() => {
    fetchUnreadCount();
    
    // Atualiza a contagem a cada 60 segundos
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setLoading(true);
    
    try {
      const response = await notificationService.getUserNotifications(0, 5);
      setNotifications(response.content);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
    }
  };
  
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        // Atualiza localmente o status da notificação
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
      }
    }
    
    // Navegação específica com base no tipo de notificação pode ser implementada aqui
    
    handleClose();
  };
  
  const handleViewAll = () => {
    navigate('/user/notifications');
    handleClose();
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
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        aria-label={`${unreadCount} notificações não lidas`}
        color="inherit"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            maxHeight: 400,
            width: '350px',
            overflow: 'auto',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ px: 1 }}>
            Notificações
          </Typography>
          
          {unreadCount > 0 && (
            <Button
              startIcon={<MarkChatReadIcon />}
              size="small"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              Nenhuma notificação disponível
            </Typography>
          </MenuItem>
        ) : (
          <>
            {notifications.map((notification) => (
              <MenuItem 
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                dense
                sx={{
                  py: 1.5,
                  borderLeft: notification.isRead ? 'none' : '4px solid #1976d2',
                  bgcolor: notification.isRead ? 'inherit' : 'rgba(25, 118, 210, 0.05)'
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: '230px' }}>
                      {notification.title}
                    </Typography>
                    {!notification.isRead && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          ml: 1
                        }}
                      />
                    )}
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                    }}
                  >
                    {notification.content}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {formatDate(notification.createdAt)}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            
            <Divider />
            
            <MenuItem onClick={handleViewAll}>
              <Typography variant="body2" color="primary" sx={{ width: '100%', textAlign: 'center' }}>
                Ver todas as notificações
              </Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationsMenu; 