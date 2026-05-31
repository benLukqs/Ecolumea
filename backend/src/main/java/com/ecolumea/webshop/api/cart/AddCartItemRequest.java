package com.ecolumea.webshop.api.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record AddCartItemRequest(
        String sessionKey,
        @NotBlank String productSlug,
        @Min(1) int quantity
) {
}
