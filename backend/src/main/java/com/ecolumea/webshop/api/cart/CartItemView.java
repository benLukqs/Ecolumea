package com.ecolumea.webshop.api.cart;

import java.math.BigDecimal;

public record CartItemView(
        long id,
        String productSlug,
        String productName,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal,
        String currency
) {
}
