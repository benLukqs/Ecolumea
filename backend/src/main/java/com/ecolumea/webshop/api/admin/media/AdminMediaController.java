package com.ecolumea.webshop.api.admin.media;

import com.ecolumea.webshop.api.auth.AdminAuthorizationService;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/media")
public class AdminMediaController {

    private final AdminMediaService adminMediaService;
    private final AdminAuthorizationService adminAuthorizationService;

    public AdminMediaController(AdminMediaService adminMediaService, AdminAuthorizationService adminAuthorizationService) {
        this.adminMediaService = adminMediaService;
        this.adminAuthorizationService = adminAuthorizationService;
    }

    @GetMapping("/products")
    public List<AdminMediaProductOption> listProducts(@RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminMediaService.getProductOptions();
    }

    @GetMapping("/products/{productId}/images")
    public List<AdminProductImageView> listProductImages(
        @PathVariable long productId,
        @RequestHeader("X-Auth-Token") String authToken
    ) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminMediaService.getProductImages(productId);
    }

    @PostMapping(value = "/products/{productId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AdminProductImageView uploadProductImage(
        @PathVariable long productId,
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "title", required = false) String title,
        @RequestParam(value = "altText", required = false) String altText,
        @RequestParam(value = "sortOrder", required = false) Integer sortOrder,
        @RequestParam(value = "isPrimary", required = false) Boolean isPrimary,
        @RequestHeader("X-Auth-Token") String authToken
    ) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminMediaService.uploadProductImage(productId, file, title, altText, sortOrder, isPrimary);
    }

    @PutMapping("/images/{imageId}/primary")
    public AdminProductImageView setPrimaryImage(
        @PathVariable long imageId,
        @RequestHeader("X-Auth-Token") String authToken
    ) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        return adminMediaService.setPrimary(imageId);
    }

    @DeleteMapping("/images/{imageId}")
    public void deleteImage(@PathVariable long imageId, @RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_PRODUCT", "SUPER_ADMIN");
        adminMediaService.deleteImage(imageId);
    }
}
