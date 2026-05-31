package com.ecolumea.webshop.api.cart;

import jakarta.validation.constraints.Min;

public record UpdateCartItemRequest(
        String sessionKey,
        @Min(1) int quantity
) {
}
