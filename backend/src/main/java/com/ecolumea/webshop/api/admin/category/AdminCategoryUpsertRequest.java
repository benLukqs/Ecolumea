package com.ecolumea.webshop.api.admin.category;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record AdminCategoryUpsertRequest(
        @NotBlank String name,
        @NotBlank String slug,
        String description,
        String sustainabilityAspect,
        @Min(0) int sortOrder,
        boolean active
) {
}
