package com.ecolumea.webshop.api.catalog;

import java.math.BigDecimal;
import java.util.List;

public record ProductDetail(
        String name,
        String slug,
        String shortDescription,
        String longDescription,
        String primaryImageUrl,
        List<String> galleryImageUrls,
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
        String categorySlug,
        String categoryName
) {
}