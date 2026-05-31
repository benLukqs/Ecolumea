package com.ecolumea.webshop.api.account;

import java.util.List;

import com.ecolumea.webshop.api.auth.AuthSessionService;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AccountService accountService;
    private final AuthSessionService authSessionService;

    public AccountController(AccountService accountService, AuthSessionService authSessionService) {
        this.accountService = accountService;
        this.authSessionService = authSessionService;
    }

    @GetMapping("/addresses")
    public List<AccountAddressView> addresses(@RequestHeader("X-Auth-Token") String authToken) {
        long userId = authSessionService.requireUserId(authToken);
        return accountService.getAddresses(userId);
    }

    @PostMapping("/addresses")
    public AccountAddressView createAddress(
            @RequestHeader("X-Auth-Token") String authToken,
            @Valid @RequestBody AccountAddressUpsertRequest request
    ) {
        long userId = authSessionService.requireUserId(authToken);
        return accountService.createAddress(userId, request);
    }

    @PutMapping("/addresses/{id}")
    public AccountAddressView updateAddress(
            @RequestHeader("X-Auth-Token") String authToken,
            @PathVariable long id,
            @Valid @RequestBody AccountAddressUpsertRequest request
    ) {
        long userId = authSessionService.requireUserId(authToken);
        return accountService.updateAddress(userId, id, request);
    }

    @GetMapping("/orders")
    public List<AccountOrderHistoryItem> orderHistory(@RequestHeader("X-Auth-Token") String authToken) {
        long userId = authSessionService.requireUserId(authToken);
        return accountService.getOrderHistory(userId);
    }
}
