import React, { useEffect, useState } from 'react';
import { 
  Badge, IconButton, Menu, MenuItem, Typography, Box, Divider, 
  ListItemIcon, ListItemText, Button, CircularProgress 
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Notification, notificationService } from '../../services/notificationService';

interface NotificationMenuProps {
  onRefresh?: () => void;
}

export const NotificationMenu: React.FC<NotificationMenuProps> = ({ onRefresh }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações não lidas:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getUserNotifications(0, 5);
      setNotifications(response.content);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
      fetchUnreadCount();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM, HH:mm", { locale: ptBR });
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        color="inherit"
        aria-label="notificações"
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
          sx: { width: 350, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notificações</Typography>
          {unreadCount > 0 && (
            <IconButton size="small" onClick={handleMarkAllAsRead} title="Marcar todas como lidas">
              <DoneAllIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma notificação disponível
                </Typography>
              </Box>
            ) : (
              notifications.map((notification) => (
                <MenuItem 
                  key={notification.id}
                  sx={{ 
                    py: 1.5,
                    px: 2,
                    backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: notification.isRead ? 'action.hover' : 'action.selected',
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {notification.title}
                      </Typography>
                      
                      {!notification.isRead && (
                        <ListItemIcon sx={{ minWidth: 'auto' }}>
                          <IconButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            size="small"
                            title="Marcar como lida"
                          >
                            <MarkEmailReadIcon fontSize="small" />
                          </IconButton>
                        </ListItemIcon>
                      )}
                    </Box>
                    
                    <ListItemText 
                      primary={
                        <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                          {notification.content}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatNotificationDate(notification.createdAt)}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  </Box>
                </MenuItem>
              ))
            )}
            
            <Divider />
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
              <Button 
                component={Link} 
                to="/notifications" 
                size="small" 
                onClick={handleClose}
                fullWidth
              >
                Ver todas
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}; 