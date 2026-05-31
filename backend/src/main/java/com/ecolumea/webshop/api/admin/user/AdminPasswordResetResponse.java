package com.ecolumea.webshop.api.admin.user;

public record AdminPasswordResetResponse(
        long userId,
        String temporaryPassword
) {
}
