package com.carrent.domain.repository;

import com.carrent.domain.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Encontra todas as notificações de um usuário ordenadas por data de criação
     * (mais recentes primeiro)
     * 
     * @param userId ID do usuário
     * @return Lista de notificações do usuário
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Encontra todas as notificações de um usuário com paginação
     * 
     * @param userId   ID do usuário
     * @param pageable Configuração de paginação
     * @return Página de notificações
     */
    Page<Notification> findByUserId(Long userId, Pageable pageable);

    /**
     * Conta o número de notificações não lidas para um usuário
     * 
     * @param userId ID do usuário
     * @param isRead Status de leitura (false para não lidas)
     * @return Número de notificações não lidas
     */
    long countByUserIdAndIsRead(Long userId, boolean isRead);

    /**
     * Encontra todas as notificações de um usuário por status de leitura, ordenadas
     * por data de criação
     * 
     * @param userId ID do usuário
     * @param isRead Status de leitura (true/false)
     * @return Lista de notificações do usuário com o status especificado
     */
    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(Long userId, boolean isRead);
}