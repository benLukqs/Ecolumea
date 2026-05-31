package com.ecolumea.webshop.api.admin.category;

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
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final AdminCategoryService adminCategoryService;
    private final AdminAuthorizationService adminAuthorizationService;

    public AdminCategoryController(AdminCategoryService adminCategoryService, AdminAuthorizationService adminAuthorizationService) {
        this.adminCategoryService = adminCategoryService;
        this.adminAuthorizationService = adminAuthorizationService;
    }

    @GetMapping
    public List<AdminCategoryView> listCategories(@RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminCategoryService.getCategories();
    }

    @GetMapping("/{id}")
    public AdminCategoryView getCategory(@PathVariable long id, @RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminCategoryService.getCategoryById(id);
    }

    @PostMapping
    public AdminCategoryView createCategory(@Valid @RequestBody AdminCategoryUpsertRequest request, @RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminCategoryService.createCategory(request);
    }

    @PutMapping("/{id}")
    public AdminCategoryView updateCategory(@PathVariable long id, @Valid @RequestBody AdminCategoryUpsertRequest request, @RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminCategoryService.updateCategory(id, request);
    }
}
