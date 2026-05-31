package com.ecolumea.webshop.api.catalog;

public record CategorySummary(
        String name,
        String slug,
        String description,
        String sustainabilityAspect,
        int sortOrder,
        boolean active
) {
}
