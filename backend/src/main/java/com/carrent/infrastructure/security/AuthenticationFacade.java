package com.carrent.infrastructure.security;

import com.carrent.domain.entity.User;
import com.carrent.domain.exception.UnauthorizedException;
import com.carrent.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Fachada para operações de autenticação
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuthenticationFacade {

    private final UserRepository userRepository;

    /**
     * Obtém o usuário autenticado atualmente
     * 
     * @return Usuário autenticado
     * @throws UnauthorizedException se não houver usuário autenticado
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            !(authentication.getPrincipal() instanceof User)) {
            log.error("Usuário não autenticado ou principal inválido");
            throw new UnauthorizedException("Usuário não autenticado");
        }
        
        return (User) authentication.getPrincipal();
    }
    
    /**
     * Obtém o ID do usuário autenticado atualmente
     * 
     * @return ID do usuário autenticado
     * @throws UnauthorizedException se não houver usuário autenticado
     */
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
    
    /**
     * Verifica se o usuário atual é dono do recurso pelo ID
     * 
     * @param resourceUserId ID do usuário dono do recurso
     * @return true se o usuário autenticado for dono do recurso, false caso contrário
     */
    public boolean isResourceOwner(Long resourceUserId) {
        if (resourceUserId == null) {
            return false;
        }
        
        try {
            Long currentUserId = getCurrentUserId();
            return currentUserId.equals(resourceUserId);
        } catch (UnauthorizedException e) {
            return false;
        }
    }
} 