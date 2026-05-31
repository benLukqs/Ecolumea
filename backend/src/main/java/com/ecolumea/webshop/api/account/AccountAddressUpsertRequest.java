package com.ecolumea.webshop.api.account;

import jakarta.validation.constraints.NotBlank;

public record AccountAddressUpsertRequest(
        @NotBlank String street,
        @NotBlank String houseNumber,
        @NotBlank String postalCode,
        @NotBlank String city,
        @NotBlank String countryCode,
        boolean isDefault
) {
}
