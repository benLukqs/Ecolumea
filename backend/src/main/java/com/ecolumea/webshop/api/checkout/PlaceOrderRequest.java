package com.ecolumea.webshop.api.checkout;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PlaceOrderRequest(
        @NotBlank String sessionKey,
        @Email String guestEmail,
        @NotBlank String shippingAddressSnapshot,
        @NotBlank String billingAddressSnapshot,
        @NotBlank String shippingProvider,
        Boolean privacyAccepted
) {
}
