package com.ecolumea.webshop.api.account;

import java.math.BigDecimal;

public record AccountOrderHistoryItem(
        long id,
        String orderNumber,
        BigDecimal totalAmount,
        String currency,
        String orderStatus,
        String paymentStatus,
        String shippingProvider,
        String createdAt
) {
}
