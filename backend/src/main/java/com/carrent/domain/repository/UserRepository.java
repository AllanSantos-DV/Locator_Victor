package com.carrent.domain.repository;

import com.carrent.domain.entity.Role;
import com.carrent.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Busca usuários com determinado papel
     * 
     * @param role Papel a ser buscado
     * @return Lista de usuários com o papel especificado
     */
    List<User> findByRole(Role role);

    /**
     * Busca usuários cujo papel não corresponde ao especificado
     * 
     * @param role Papel a ser excluído da busca
     * @return Lista de usuários que não possuem o papel especificado
     */
    List<User> findByRoleNot(Role role);
}