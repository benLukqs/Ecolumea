package com.ecolumea.webshop.api.admin.order;

import java.math.BigDecimal;

public record AdminOrderListItem(
        long id,
        String orderNumber,
        String guestEmail,
        BigDecimal totalAmount,
        String currency,
        String orderStatus,
        String paymentStatus,
        String shippingProvider,
        String createdAt
) {
}
