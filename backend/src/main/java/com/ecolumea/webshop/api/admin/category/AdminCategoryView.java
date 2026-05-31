package com.ecolumea.webshop.api.admin.category;

public record AdminCategoryView(
        long id,
        String name,
        String slug,
        String description,
        String sustainabilityAspect,
        int sortOrder,
        boolean active
) {
}
