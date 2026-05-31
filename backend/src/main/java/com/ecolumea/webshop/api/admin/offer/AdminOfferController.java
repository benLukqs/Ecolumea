package com.ecolumea.webshop.api.admin.offer;

import com.ecolumea.webshop.api.auth.AdminAuthorizationService;
import java.util.List;

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
@RequestMapping("/api/admin/offers")
public class AdminOfferController {

    private final AdminOfferService adminOfferService;
    private final AdminAuthorizationService adminAuthorizationService;

    public AdminOfferController(AdminOfferService adminOfferService, AdminAuthorizationService adminAuthorizationService) {
        this.adminOfferService = adminOfferService;
        this.adminAuthorizationService = adminAuthorizationService;
    }

    @GetMapping
    public List<AdminOfferView> listOffers(@RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminOfferService.getOffers();
    }

    @GetMapping("/{id}")
    public AdminOfferView getOffer(@PathVariable long id, @RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminOfferService.getOfferById(id);
    }

    @PostMapping
    public AdminOfferView createOffer(@Valid @RequestBody AdminOfferUpsertRequest request, @RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminOfferService.createOffer(request);
    }

    @PutMapping("/{id}")
    public AdminOfferView updateOffer(@PathVariable long id, @Valid @RequestBody AdminOfferUpsertRequest request, @RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminOfferService.updateOffer(id, request);
    }
}
