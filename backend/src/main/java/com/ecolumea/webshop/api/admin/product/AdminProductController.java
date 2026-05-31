package com.ecolumea.webshop.api.admin.product;

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
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final AdminProductService adminProductService;
    private final AdminAuthorizationService adminAuthorizationService;

    public AdminProductController(AdminProductService adminProductService, AdminAuthorizationService adminAuthorizationService) {
        this.adminProductService = adminProductService;
        this.adminAuthorizationService = adminAuthorizationService;
    }

    @GetMapping
    public List<AdminProductView> listProducts(@RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminProductService.getProducts();
    }

    @GetMapping("/{id}")
    public AdminProductView getProduct(@PathVariable long id, @RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminProductService.getProductById(id);
    }

    @GetMapping("/categories")
    public List<AdminCategoryOption> categoryOptions(@RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminProductService.getCategoryOptions();
    }

    @PostMapping
    public AdminProductView createProduct(@Valid @RequestBody AdminProductUpsertRequest request, @RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminProductService.createProduct(request);
    }

    @PutMapping("/{id}")
    public AdminProductView updateProduct(@PathVariable long id, @Valid @RequestBody AdminProductUpsertRequest request, @RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminProductService.updateProduct(id, request);
    }
}
