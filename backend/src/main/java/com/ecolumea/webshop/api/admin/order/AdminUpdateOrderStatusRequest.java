package com.ecolumea.webshop.api.admin.order;

import jakarta.validation.constraints.NotBlank;

public record AdminUpdateOrderStatusRequest(
        @NotBlank String orderStatus
) {
}