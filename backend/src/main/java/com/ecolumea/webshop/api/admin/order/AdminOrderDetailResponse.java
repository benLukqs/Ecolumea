package com.ecolumea.webshop.api.admin.order;

import java.math.BigDecimal;
import java.util.List;

public record AdminOrderDetailResponse(
        long id,
        String orderNumber,
        String guestEmail,
        String shippingAddressSnapshot,
        String billingAddressSnapshot,
        BigDecimal subtotalAmount,
        BigDecimal shippingAmount,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        String currency,
        String orderStatus,
        String paymentStatus,
        String shippingProvider,
        String createdAt,
        List<AdminOrderItemView> items
) {
}
