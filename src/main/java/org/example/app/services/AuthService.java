package org.example.app.services;

import org.example.app.dto.auth.AuthResponse;
import org.example.app.dto.auth.LoginRequest;
import org.example.app.dto.auth.RegisterRequest;

import org.example.app.entity.AppUser;
import org.example.app.repository.AppUserRepository;
import org.example.app.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            AppUserRepository repository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager =
                authenticationManager;
    }

    public AuthResponse register(
            RegisterRequest request
    ) {

        if (
                repository.existsByEmail(
                        request.email()
                )
        ) {
            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        AppUser.Role role =
                request.role() == null
                        ? AppUser.Role.RECOVERY_ANALYST
                        : request.role();

        AppUser user =
                new AppUser(
                        request.name(),
                        request.email(),
                        passwordEncoder.encode(
                                request.password()
                        ),
                        role
                );

        AppUser saved =
                repository.save(user);

        String token =
                jwtService.generateToken(
                        saved.getEmail(),
                        saved.getRole().name()
                );

        return createResponse(
                saved,
                token
        );
    }

    public AuthResponse login(
            LoginRequest request
    ) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        AppUser user =
                repository
                        .findByEmail(
                                request.email()
                        )
                        .orElseThrow();

        String token =
                jwtService.generateToken(
                        user.getEmail(),
                        user.getRole().name()
                );

        return createResponse(
                user,
                token
        );
    }

    private AuthResponse createResponse(
            AppUser user,
            String token
    ) {

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}