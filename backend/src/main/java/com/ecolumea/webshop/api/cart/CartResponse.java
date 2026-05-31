package com.ecolumea.webshop.api.cart;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        long cartId,
        String sessionKey,
        List<CartItemView> items,
        BigDecimal subtotalAmount,
        BigDecimal discountAmount,
        String appliedOfferName,
        BigDecimal shippingAmount,
        BigDecimal totalAmount,
        String currency,
        BigDecimal freeShippingThreshold,
        boolean freeShippingReached
) {
}
