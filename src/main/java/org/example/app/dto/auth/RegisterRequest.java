package org.example.app.dto.auth;

import org.example.app.entity.AppUser;

public record RegisterRequest(
        String name,
        String email,
        String password,
        AppUser.Role role
) {
}