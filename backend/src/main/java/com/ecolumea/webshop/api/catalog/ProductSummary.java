package com.ecolumea.webshop.api.catalog;

import java.math.BigDecimal;

public record ProductSummary(
        String name,
        String slug,
        String shortDescription,
        String primaryImageUrl,
        int stockQuantity,
        BigDecimal price,
        String currency,
        BigDecimal offerPrice,
        BigDecimal discountAmount,
        String appliedOfferName,
        boolean hasOffer,
        String materialOrigin,
        String manufacturingProcess,
        String sustainabilityImpact,
        boolean featured,
        String categorySlug
) {
}
