package com.ecolumea.webshop.api.auth;

public record AuthResponse(
        String authToken,
        AuthUserView user
) {
}
