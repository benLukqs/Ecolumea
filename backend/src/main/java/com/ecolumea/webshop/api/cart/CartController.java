package com.ecolumea.webshop.api.cart;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartResponse getCart(@RequestParam(required = false) String sessionKey) {
        return cartService.getCart(sessionKey);
    }

    @PostMapping("/items")
    public CartResponse addItem(@Valid @RequestBody AddCartItemRequest request) {
        return cartService.addItem(request.sessionKey(), request.productSlug(), request.quantity());
    }

    @PatchMapping("/items/{itemId}")
    public CartResponse updateItemQuantity(@PathVariable long itemId, @Valid @RequestBody UpdateCartItemRequest request) {
        return cartService.updateItemQuantity(request.sessionKey(), itemId, request.quantity());
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse removeItem(@PathVariable long itemId, @RequestParam(required = false) String sessionKey) {
        return cartService.removeItem(sessionKey, itemId);
    }
}
