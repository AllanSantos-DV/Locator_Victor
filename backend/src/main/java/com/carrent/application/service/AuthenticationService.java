package com.carrent.application.service;

import com.carrent.application.dto.AuthenticationRequest;
import com.carrent.application.dto.AuthenticationResponse;
import com.carrent.application.dto.RegisterRequest;
import com.carrent.application.dto.UpdateProfileRequest;
import com.carrent.domain.entity.User;
import com.carrent.domain.entity.Role;
import com.carrent.domain.exception.DuplicateResourceException;
import com.carrent.domain.exception.UnauthorizedException;
import com.carrent.domain.repository.UserRepository;
import com.carrent.infrastructure.metrics.CustomMetricsService;
import com.carrent.infrastructure.security.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final CustomMetricsService metricsService;

        public AuthenticationResponse register(RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new DuplicateResourceException("Email já está em uso");
                }

                var user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(Role.USER)
                                .build();

                userRepository.save(user);

                var jwtToken = jwtService.generateToken(user);
                var refreshToken = jwtService.generateRefreshToken(user);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .refreshToken(refreshToken)
                                .user(AuthenticationResponse.UserDTO.fromUser(user))
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                try {
                        metricsService.incrementAuthAttempts();
                        authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                        request.getEmail(),
                                                        request.getPassword()));

                        var user = userRepository.findByEmail(request.getEmail())
                                        .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

                        var jwtToken = jwtService.generateToken(user);
                        var refreshToken = jwtService.generateRefreshToken(user);

                        return AuthenticationResponse.builder()
                                        .token(jwtToken)
                                        .refreshToken(refreshToken)
                                        .user(AuthenticationResponse.UserDTO.fromUser(user))
                                        .build();
                } catch (Exception e) {
                        metricsService.incrementAuthFailures();
                        throw e;
                }
        }

        public AuthenticationResponse refreshToken(String refreshToken) {
                try {
                        Claims claims = jwtService.getAllClaimsFromToken(refreshToken);
                        String email = claims.getSubject();

                        var user = userRepository.findByEmail(email)
                                        .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

                        if (!jwtService.isTokenValid(refreshToken, user)) {
                                throw new JwtException("Refresh token inválido");
                        }

                        var newAccessToken = jwtService.generateToken(user);
                        var newRefreshToken = jwtService.generateRefreshToken(user);

                        return AuthenticationResponse.builder()
                                        .token(newAccessToken)
                                        .refreshToken(newRefreshToken)
                                        .user(AuthenticationResponse.UserDTO.fromUser(user))
                                        .build();
                } catch (ExpiredJwtException e) {
                        throw new JwtException("Refresh token expirado", e);
                } catch (JwtException e) {
                        throw new JwtException("Erro ao processar o refresh token", e);
                }
        }

        public AuthenticationResponse updateProfile(UpdateProfileRequest request) {
                // Obter o usuário autenticado
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String email = authentication.getName();

                User currentUser = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

                // Verificar a senha atual
                if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
                        throw new UnauthorizedException("Senha atual incorreta");
                }

                // Verificar se o email está sendo alterado e se já existe
                if (!currentUser.getEmail().equals(request.getEmail())
                                && userRepository.existsByEmail(request.getEmail())) {
                        throw new DuplicateResourceException("Email já está em uso por outro usuário");
                }

                // Atualizar os dados do usuário
                currentUser.setName(request.getName());
                currentUser.setEmail(request.getEmail());

                // Atualizar a senha se fornecida
                if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
                        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
                }

                userRepository.save(currentUser);

                // Gerar novos tokens
                var jwtToken = jwtService.generateToken(currentUser);
                var refreshToken = jwtService.generateRefreshToken(currentUser);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .refreshToken(refreshToken)
                                .user(AuthenticationResponse.UserDTO.fromUser(currentUser))
                                .build();
        }
}