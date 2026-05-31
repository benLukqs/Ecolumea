package com.ecolumea.webshop.api.admin.user;

import java.util.List;

public record AdminUserSummary(
        long id,
        String email,
        String firstName,
        String lastName,
        boolean active,
        List<String> roles
) {
}
