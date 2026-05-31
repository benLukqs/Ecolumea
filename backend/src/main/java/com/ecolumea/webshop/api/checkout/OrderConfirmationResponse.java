package com.ecolumea.webshop.api.checkout;

import java.math.BigDecimal;

public record OrderConfirmationResponse(
        long orderId,
        String orderNumber,
        BigDecimal totalAmount,
        String currency,
        String orderStatus,
        String paymentStatus,
        String shippingProvider
) {
}
