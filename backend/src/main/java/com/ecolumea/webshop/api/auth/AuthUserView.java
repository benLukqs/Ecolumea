package com.ecolumea.webshop.api.auth;

import java.util.List;

public record AuthUserView(
        long id,
        String email,
        String firstName,
        String lastName,
        List<String> roles
) {
}
