package com.ecolumea.webshop.api.account;

public record AccountAddressView(
        long id,
        String street,
        String houseNumber,
        String postalCode,
        String city,
        String countryCode,
        boolean isDefault
) {
}
