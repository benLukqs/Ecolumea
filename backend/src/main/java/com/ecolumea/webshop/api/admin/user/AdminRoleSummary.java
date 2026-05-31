package com.ecolumea.webshop.api.admin.user;

public record AdminRoleSummary(
        String code,
        String name,
        boolean active
) {
}
