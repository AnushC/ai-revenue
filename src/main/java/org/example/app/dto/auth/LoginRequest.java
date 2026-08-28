package org.example.app.dto.auth;

public record LoginRequest(
        String email,
        String password
) {
}