package com.carrent.application.service;

import com.carrent.application.dto.NotificationDTO;
import com.carrent.application.dto.PageResponse;
import com.carrent.domain.entity.Notification;
import com.carrent.domain.entity.User;
import com.carrent.domain.exception.ResourceNotFoundException;
import com.carrent.domain.repository.NotificationRepository;
import com.carrent.infrastructure.security.AuthenticationFacade;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AuthenticationFacade authenticationFacade;

    /**
     * Cria uma nova notificação para um usuário
     * 
     * @param user    Usuário destinatário
     * @param title   Título da notificação
     * @param content Conteúdo da notificação
     * @return A notificação criada
     */
    @Transactional
    public Notification createNotification(User user, String title, String content) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .isRead(false)
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        return savedNotification;
    }

    /**
     * Obtém as notificações do usuário autenticado
     * 
     * @param page Número da página
     * @param size Tamanho da página
     * @return Lista paginada de notificações
     */
    public PageResponse<NotificationDTO> getUserNotifications(int page, int size) {
        User currentUser = authenticationFacade.getCurrentUser();
        Page<Notification> notificationsPage = notificationRepository.findByUserId(
                currentUser.getId(),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        Page<NotificationDTO> dtoPage = notificationsPage.map(NotificationDTO::fromEntity);
        return PageResponse.fromPage(dtoPage);
    }

    /**
     * Obtém a contagem de notificações não lidas do usuário autenticado
     * 
     * @return Número de notificações não lidas
     */
    public long getUnreadNotificationsCount() {
        User currentUser = authenticationFacade.getCurrentUser();
        return notificationRepository.countByUserIdAndIsRead(currentUser.getId(), false);
    }

    /**
     * Marca uma notificação como lida
     * 
     * @param notificationId ID da notificação
     * @throws ResourceNotFoundException se a notificação não existir ou não
     *                                   pertencer ao usuário autenticado
     */
    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        User currentUser = authenticationFacade.getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada"));

        // Verificar se a notificação pertence ao usuário autenticado
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Notificação não encontrada");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    /**
     * Marca todas as notificações do usuário autenticado como lidas
     */
    @Transactional
    public void markAllNotificationsAsRead() {
        User currentUser = authenticationFacade.getCurrentUser();
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(
                currentUser.getId(), false);

        if (!unreadNotifications.isEmpty()) {
            unreadNotifications.forEach(notification -> notification.setRead(true));
            notificationRepository.saveAll(unreadNotifications);
        }
    }
}