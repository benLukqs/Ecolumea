package com.ecolumea.webshop.api.catalog;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/categories")
    public List<CategorySummary> categories() {
        return catalogService.getCategories();
    }

    @GetMapping("/featured")
    public List<ProductSummary> featuredProducts() {
        return catalogService.getFeaturedProducts();
    }

    @GetMapping("/categories/{slug}/products")
    public List<ProductSummary> productsByCategory(@PathVariable String slug) {
        return catalogService.getProductsByCategory(slug);
    }

    @GetMapping("/categories/{slug}")
    public CategorySummary categoryBySlug(@PathVariable String slug) {
        return catalogService.getCategoryBySlug(slug);
    }

    @GetMapping("/products/{slug}")
    public ProductDetail productBySlug(@PathVariable String slug) {
        return catalogService.getProductBySlug(slug);
    }
}
