package com.ecolumea.webshop.api.checkout;

import com.ecolumea.webshop.api.auth.AuthSessionService;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final AuthSessionService authSessionService;

    public CheckoutController(CheckoutService checkoutService, AuthSessionService authSessionService) {
        this.checkoutService = checkoutService;
        this.authSessionService = authSessionService;
    }

    @PostMapping("/orders")
    public OrderConfirmationResponse placeOrder(
            @Valid @RequestBody PlaceOrderRequest request,
            @RequestHeader(value = "X-Auth-Token", required = false) String authToken
    ) {
        Long userId = authSessionService.resolveUserIdOrNull(authToken);
        return checkoutService.placeOrder(request, userId);
    }
}
