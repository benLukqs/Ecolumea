package com.ecolumea.webshop.api.admin.offer;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminOfferUpsertRequest(
        @NotBlank String name,
        String description,
        @NotBlank String discountType,
        @NotNull @DecimalMin("0.00") BigDecimal discountValue,
        @NotBlank String targetType,
        Long targetCategoryId,
        Long targetProductId,
        String teaserText,
        String startsAt,
        String endsAt,
        boolean active
) {
}
