package com.carrent.infrastructure.notification;

import com.carrent.domain.entity.Notification;
import com.carrent.domain.entity.User;
import com.carrent.domain.repository.NotificationRepository;
import com.carrent.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemNotificationService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    /**
     * Envia uma notificação do sistema (armazenada para exibição na interface)
     * 
     * @param userId  ID do usuário
     * @param title   Título da notificação
     * @param content Conteúdo da notificação
     */
    @Transactional
    public void sendSystemNotification(Long userId, String title, String content) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }
}