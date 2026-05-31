package com.ecolumea.webshop.api.auth;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8, max = 120) String password,
        String firstName,
        String lastName,
        @AssertTrue(message = "Datenschutz muss akzeptiert werden") boolean privacyAccepted
) {
}
