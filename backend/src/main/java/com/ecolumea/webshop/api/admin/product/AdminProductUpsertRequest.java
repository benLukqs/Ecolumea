package com.ecolumea.webshop.api.admin.product;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotNull;

public record AdminProductUpsertRequest(
        @NotNull Long categoryId,
        @NotBlank String name,
        @NotBlank String slug,
        String shortDescription,
        String longDescription,
        @NotNull @DecimalMin("0.00") BigDecimal price,
        @NotBlank String currency,
        String materialOrigin,
        String manufacturingProcess,
        String sustainabilityImpact,
        boolean featured,
        boolean active,
        @NotNull @Min(0) Integer stockQuantity
) {
}
