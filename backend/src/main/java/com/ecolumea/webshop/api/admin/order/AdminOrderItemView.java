package com.ecolumea.webshop.api.admin.order;

import java.math.BigDecimal;

public record AdminOrderItemView(
        long id,
        String productNameSnapshot,
        int quantity,
        BigDecimal unitPriceSnapshot,
        BigDecimal lineTotalSnapshot
) {
}
