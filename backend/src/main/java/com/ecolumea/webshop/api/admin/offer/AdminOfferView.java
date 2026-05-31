package com.ecolumea.webshop.api.admin.offer;

import java.math.BigDecimal;

public record AdminOfferView(
        long id,
        String name,
        String description,
        String discountType,
        BigDecimal discountValue,
        String targetType,
        Long targetCategoryId,
        Long targetProductId,
        String teaserText,
        String startsAt,
        String endsAt,
        boolean active
) {
}
