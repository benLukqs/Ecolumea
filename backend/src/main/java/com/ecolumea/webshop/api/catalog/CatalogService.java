package com.ecolumea.webshop.api.catalog;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ecolumea.webshop.pricing.OfferPricingService;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CatalogService {

    private static final RowMapper<CategorySummary> CATEGORY_SUMMARY_MAPPER = (rs, rowNum) -> new CategorySummary(
            rs.getString("name"),
            rs.getString("slug"),
            rs.getString("description"),
            rs.getString("sustainability_aspect"),
            rs.getInt("sort_order"),
            rs.getBoolean("is_active")
    );

        private static final RowMapper<ProductSummaryBaseRow> PRODUCT_SUMMARY_BASE_MAPPER = (rs, rowNum) -> new ProductSummaryBaseRow(
            rs.getLong("product_id"),
            rs.getLong("category_id"),
            rs.getString("name"),
            rs.getString("slug"),
            rs.getString("short_description"),
            rs.getString("primary_image_path"),
            rs.getInt("stock_quantity"),
            rs.getBigDecimal("price"),
            rs.getString("currency"),
            rs.getString("material_origin"),
            rs.getString("manufacturing_process"),
            rs.getString("sustainability_impact"),
            rs.getBoolean("is_featured"),
            rs.getString("category_slug")
        );

    private final JdbcTemplate jdbcTemplate;
    private final OfferPricingService offerPricingService;
    private final String mediaBaseUrl;

    public CatalogService(
        JdbcTemplate jdbcTemplate,
        OfferPricingService offerPricingService,
        @Value("${app.media.public-base-url:/media}") String mediaBaseUrl
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.offerPricingService = offerPricingService;
        this.mediaBaseUrl = normalizeBaseUrl(mediaBaseUrl);
    }

    public List<CategorySummary> getCategories() {
        return jdbcTemplate.query(
                """
                SELECT c.name, c.slug, c.description, c.sustainability_aspect, c.sort_order, c.is_active
                FROM categories c
                WHERE c.is_active = 1
                ORDER BY c.sort_order ASC, c.name ASC
                """,
                CATEGORY_SUMMARY_MAPPER
        );
    }

    public List<ProductSummary> getFeaturedProducts() {
        return jdbcTemplate.query(
                """
            SELECT p.id AS product_id, p.name, p.slug, p.short_description, p.stock_quantity, p.price, p.currency,
                       p.material_origin, p.manufacturing_process, p.sustainability_impact,
                      p.is_featured, c.slug AS category_slug,
                  c.id AS category_id,
                      (
                        SELECT pi.file_path
                        FROM product_images pi
                        WHERE pi.product_id = p.id
                        ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
                        LIMIT 1
                      ) AS primary_image_path
                FROM products p
                JOIN categories c ON c.id = p.category_id
                WHERE p.is_active = 1 AND p.is_featured = 1 AND c.is_active = 1
                ORDER BY p.updated_at DESC, p.id DESC
                """,
            (rs, rowNum) -> toProductSummary(PRODUCT_SUMMARY_BASE_MAPPER.mapRow(rs, rowNum))
        );
    }

    public List<ProductSummary> getProductsByCategory(String categorySlug) {
        return jdbcTemplate.query(
                """
            SELECT p.id AS product_id, p.name, p.slug, p.short_description, p.stock_quantity, p.price, p.currency,
                       p.material_origin, p.manufacturing_process, p.sustainability_impact,
                      p.is_featured, c.slug AS category_slug,
                  c.id AS category_id,
                      (
                        SELECT pi.file_path
                        FROM product_images pi
                        WHERE pi.product_id = p.id
                        ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
                        LIMIT 1
                      ) AS primary_image_path
                FROM products p
                JOIN categories c ON c.id = p.category_id
                WHERE p.is_active = 1 AND c.is_active = 1 AND lower(c.slug) = lower(?)
                ORDER BY p.updated_at DESC, p.id DESC
                """,
            (rs, rowNum) -> toProductSummary(PRODUCT_SUMMARY_BASE_MAPPER.mapRow(rs, rowNum)),
                categorySlug
        );
    }

    public CategorySummary getCategoryBySlug(String slug) {
        List<CategorySummary> rows = jdbcTemplate.query(
                """
                SELECT c.name, c.slug, c.description, c.sustainability_aspect, c.sort_order, c.is_active
                FROM categories c
                WHERE c.is_active = 1 AND lower(c.slug) = lower(?)
                LIMIT 1
                """,
                CATEGORY_SUMMARY_MAPPER,
                slug
        );
        if (rows.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "Category not found");
        }
        return rows.getFirst();
    }

    public ProductDetail getProductBySlug(String slug) {
        List<ProductDetailBaseRow> rows = jdbcTemplate.query(
                """
                 SELECT p.id AS product_id,
                     p.name, p.slug, p.short_description, p.long_description, p.stock_quantity, p.price, p.currency,
                       p.material_origin, p.manufacturing_process, p.sustainability_impact,
                   p.is_featured, c.slug AS category_slug, c.name AS category_name,
                   c.id AS category_id,
                   (
                 SELECT pi.file_path
                 FROM product_images pi
                 WHERE pi.product_id = p.id
                 ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
                 LIMIT 1
                   ) AS primary_image_path
                FROM products p
                JOIN categories c ON c.id = p.category_id
                WHERE p.is_active = 1 AND c.is_active = 1 AND lower(p.slug) = lower(?)
                LIMIT 1
                """,
            (rs, rowNum) -> new ProductDetailBaseRow(
                rs.getLong("product_id"),
                rs.getString("name"),
                rs.getString("slug"),
                rs.getString("short_description"),
                rs.getString("long_description"),
                rs.getString("primary_image_path"),
                rs.getInt("stock_quantity"),
                rs.getBigDecimal("price"),
                rs.getString("currency"),
                rs.getString("material_origin"),
                rs.getString("manufacturing_process"),
                rs.getString("sustainability_impact"),
                rs.getBoolean("is_featured"),
                rs.getString("category_slug"),
                rs.getString("category_name"),
                rs.getLong("category_id")
            ),
                slug
        );
        if (rows.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "Product not found");
        }

        ProductDetailBaseRow base = rows.getFirst();
        List<String> galleryImageUrls = jdbcTemplate.query(
            """
            SELECT pi.file_path
            FROM product_images pi
            WHERE pi.product_id = ?
            ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
            """,
            (rs, rowNum) -> rs.getString("file_path"),
            base.productId()
        ).stream().map(this::toMediaUrl).collect(Collectors.toList());

        ProductPricing pricing = resolvePricing(base.productId(), base.categoryId(), base.price());

        return new ProductDetail(
            base.name(),
            base.slug(),
            base.shortDescription(),
            base.longDescription(),
            toMediaUrl(base.primaryImagePath()),
            galleryImageUrls,
            base.stockQuantity(),
            base.price(),
            base.currency(),
            pricing.offerPrice(),
            pricing.discountAmount(),
            pricing.appliedOfferName(),
            pricing.hasOffer(),
            base.materialOrigin(),
            base.manufacturingProcess(),
            base.sustainabilityImpact(),
            base.featured(),
            base.categorySlug(),
            base.categoryName()
        );
    }

    private ProductSummary toProductSummary(ProductSummaryBaseRow base) {
        ProductPricing pricing = resolvePricing(base.productId(), base.categoryId(), base.price());
        return new ProductSummary(
                base.name(),
                base.slug(),
                base.shortDescription(),
                toMediaUrl(base.primaryImagePath()),
                base.stockQuantity(),
                base.price(),
                base.currency(),
                pricing.offerPrice(),
                pricing.discountAmount(),
                pricing.appliedOfferName(),
                pricing.hasOffer(),
                base.materialOrigin(),
                base.manufacturingProcess(),
                base.sustainabilityImpact(),
                base.featured(),
                base.categorySlug()
        );
    }

    private ProductPricing resolvePricing(long productId, long categoryId, BigDecimal basePrice) {
        OfferPricingService.DiscountResult discountResult = offerPricingService.calculateBestDiscount(
                List.of(new OfferPricingService.PricingLine(productId, categoryId, basePrice))
        );

        BigDecimal discountAmount = discountResult.discountAmount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal offerPrice = basePrice.subtract(discountAmount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        boolean hasOffer = discountAmount.compareTo(BigDecimal.ZERO) > 0;
        return new ProductPricing(offerPrice, discountAmount, discountResult.offerName(), hasOffer);
    }

    private String toMediaUrl(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return null;
        }
        String fileName = filePath.replace("\\", "/");
        int lastSlash = fileName.lastIndexOf('/');
        if (lastSlash >= 0) {
            fileName = fileName.substring(lastSlash + 1);
        }
        return mediaBaseUrl + "/" + fileName;
    }

    private static String normalizeBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return "/media";
        }
        String trimmed = baseUrl.trim();
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

        private record ProductDetailBaseRow(
            long productId,
            String name,
            String slug,
            String shortDescription,
            String longDescription,
            String primaryImagePath,
            int stockQuantity,
            java.math.BigDecimal price,
            String currency,
            String materialOrigin,
            String manufacturingProcess,
            String sustainabilityImpact,
            boolean featured,
            String categorySlug,
                String categoryName,
                long categoryId
        ) {
        }

    private record ProductSummaryBaseRow(
        long productId,
        long categoryId,
        String name,
        String slug,
        String shortDescription,
        String primaryImagePath,
        int stockQuantity,
        BigDecimal price,
        String currency,
        String materialOrigin,
        String manufacturingProcess,
        String sustainabilityImpact,
        boolean featured,
        String categorySlug
    ) {
    }

            private record ProductPricing(
                BigDecimal offerPrice,
                BigDecimal discountAmount,
                String appliedOfferName,
                boolean hasOffer
            ) {
            }
}
