package com.carrent.application.service.admin;

import com.carrent.application.dto.UserDTO;
import com.carrent.application.dto.admin.NotificationRequest;
import com.carrent.application.dto.admin.UserCreateRequest;
import com.carrent.application.dto.admin.UserUpdateRequest;
import com.carrent.domain.entity.Role;
import com.carrent.domain.entity.User;
import com.carrent.domain.exception.DuplicateResourceException;
import com.carrent.domain.exception.ResourceNotFoundException;
import com.carrent.domain.repository.UserRepository;
import com.carrent.infrastructure.notification.SystemNotificationService;
import com.carrent.infrastructure.security.AuthenticationFacade;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SystemNotificationService systemNotificationService;
    private final AuthenticationFacade authenticationFacade;

    /**
     * Obtém todos os usuários normais do sistema (não administradores),
     * excluindo o usuário autenticado da listagem
     * 
     * @return Lista de usuários com perfil não-ADMIN, exceto o usuário atual
     */
    public List<UserDTO> getAllUsers() {
        User currentUser = authenticationFacade.getCurrentUser();
        Long currentUserId = currentUser.getId();

        // Usa o método do repositório que filtra diretamente no banco de dados
        return userRepository.findByRoleNot(Role.ADMIN).stream()
                .filter(user -> !user.getId().equals(currentUserId)) // Exclui o usuário atual
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtém todos os usuários do sistema, incluindo administradores,
     * mas excluindo o usuário autenticado da listagem
     * 
     * @return Lista completa de usuários, exceto o usuário atual
     */
    public List<UserDTO> getAllUsersIncludingAdmins() {
        User currentUser = authenticationFacade.getCurrentUser();
        Long currentUserId = currentUser.getId();

        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUserId)) // Exclui o usuário atual
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtém um usuário específico por ID
     * 
     * @param id ID do usuário
     * @return DTO do usuário
     * @throws ResourceNotFoundException se o usuário não existir
     */
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        return mapToDTO(user);
    }

    /**
     * Cria um novo usuário
     * 
     * @param request Dados do novo usuário
     * @return DTO do usuário criado
     * @throws DuplicateResourceException se já existir um usuário com o mesmo email
     */
    @Transactional
    public UserDTO createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Já existe um usuário com o email: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    /**
     * Atualiza um usuário existente
     * 
     * @param id      ID do usuário
     * @param request Novos dados do usuário
     * @return DTO do usuário atualizado
     * @throws ResourceNotFoundException  se o usuário não existir
     * @throws DuplicateResourceException se o novo email já estiver em uso por
     *                                    outro usuário
     * @throws AccessDeniedException      se o usuário for um administrador
     */
    @Transactional
    public UserDTO updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        // Verificar se o usuário é um administrador
        if (user.getRole() == com.carrent.domain.entity.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Não é permitido modificar usuários administradores");
        }

        // Verificar se o email já está em uso por outro usuário
        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Já existe um usuário com o email: " + request.getEmail());
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        // Atualizar senha apenas se fornecida
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser);
    }

    /**
     * Remove um usuário
     * 
     * @param id ID do usuário
     * @throws ResourceNotFoundException se o usuário não existir
     * @throws AccessDeniedException     se o usuário for um administrador
     */
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        // Verificar se o usuário é um administrador
        if (user.getRole() == com.carrent.domain.entity.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Não é permitido remover usuários administradores");
        }

        userRepository.deleteById(id);
    }

    /**
     * Envia uma notificação para um usuário
     * 
     * @param id      ID do usuário
     * @param request Dados da notificação
     * @throws ResourceNotFoundException se o usuário não existir
     */
    public void notifyUser(Long id, NotificationRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        // Sempre enviar como notificação do sistema, independente do tipo solicitado
        systemNotificationService.sendSystemNotification(user.getId(), request.getTitle(), request.getContent());
    }

    /**
     * Mapeia uma entidade User para um DTO UserDTO
     * 
     * @param user Entidade User
     * @return DTO UserDTO
     */
    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}