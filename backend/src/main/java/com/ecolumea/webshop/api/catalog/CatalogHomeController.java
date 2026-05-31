package com.ecolumea.webshop.api.catalog;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
public class CatalogHomeController {

    private final CatalogService catalogService;

    public CatalogHomeController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public Map<String, Object> home() {
        return Map.of(
                "featuredProducts", catalogService.getFeaturedProducts(),
            "categories", catalogService.getCategories().stream().limit(3).toList()
        );
    }
}
