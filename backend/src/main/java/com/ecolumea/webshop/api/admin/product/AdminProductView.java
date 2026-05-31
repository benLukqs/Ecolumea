package com.ecolumea.webshop.api.admin.product;

import java.math.BigDecimal;

public record AdminProductView(
        long id,
        String name,
        String slug,
        String shortDescription,
        String longDescription,
        BigDecimal price,
        String currency,
        String materialOrigin,
        String manufacturingProcess,
        String sustainabilityImpact,
        boolean featured,
        boolean active,
        int stockQuantity,
        long categoryId,
        String categoryName,
        String categorySlug
) {
}
