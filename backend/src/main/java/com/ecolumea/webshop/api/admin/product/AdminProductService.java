package com.ecolumea.webshop.api.admin.product;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AdminProductService {

    private final JdbcTemplate jdbcTemplate;

    public AdminProductService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AdminProductView> getProducts() {
        return jdbcTemplate.query(
                baseProductSelect() + " ORDER BY p.updated_at DESC, p.id DESC",
                productRowMapper()
        );
    }

    public AdminProductView getProductById(long id) {
        List<AdminProductView> rows = jdbcTemplate.query(
                baseProductSelect() + " WHERE p.id = ? LIMIT 1",
                productRowMapper(),
                id
        );
        if (rows.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "Product not found");
        }
        return rows.getFirst();
    }

    public List<AdminCategoryOption> getCategoryOptions() {
        return jdbcTemplate.query(
                """
                SELECT c.id, c.name, c.slug
                FROM categories c
                WHERE c.is_active = 1
                ORDER BY c.sort_order ASC, c.name ASC
                """,
                (rs, rowNum) -> new AdminCategoryOption(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("slug")
                )
        );
    }

    @Transactional
    public AdminProductView createProduct(AdminProductUpsertRequest request) {
        jdbcTemplate.update(
                """
                INSERT INTO products (
                  category_id,
                  name,
                  slug,
                  short_description,
                  long_description,
                  price,
                  currency,
                  material_origin,
                  manufacturing_process,
                  sustainability_impact,
                  is_featured,
                  is_active,
                  stock_quantity
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                request.categoryId(),
                request.name(),
                request.slug(),
                request.shortDescription(),
                request.longDescription(),
                request.price(),
                request.currency(),
                request.materialOrigin(),
                request.manufacturingProcess(),
                request.sustainabilityImpact(),
                request.featured(),
                request.active(),
                request.stockQuantity()
        );

        Long id = jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
        if (id == null) {
            throw new IllegalStateException("Product creation failed");
        }
        return getProductById(id);
    }

    @Transactional
    public AdminProductView updateProduct(long id, AdminProductUpsertRequest request) {
        int updated = jdbcTemplate.update(
                """
                UPDATE products
                SET category_id = ?,
                    name = ?,
                    slug = ?,
                    short_description = ?,
                    long_description = ?,
                    price = ?,
                    currency = ?,
                    material_origin = ?,
                    manufacturing_process = ?,
                    sustainability_impact = ?,
                    is_featured = ?,
                    is_active = ?,
                    stock_quantity = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                request.categoryId(),
                request.name(),
                request.slug(),
                request.shortDescription(),
                request.longDescription(),
                request.price(),
                request.currency(),
                request.materialOrigin(),
                request.manufacturingProcess(),
                request.sustainabilityImpact(),
                request.featured(),
                request.active(),
                request.stockQuantity(),
                id
        );

        if (updated == 0) {
            throw new ResponseStatusException(NOT_FOUND, "Product not found");
        }
        return getProductById(id);
    }

    private String baseProductSelect() {
        return """
                SELECT p.id,
                       p.name,
                       p.slug,
                       p.short_description,
                       p.long_description,
                       p.price,
                       p.currency,
                       p.material_origin,
                       p.manufacturing_process,
                       p.sustainability_impact,
                       p.is_featured,
                       p.is_active,
                       p.stock_quantity,
                       c.id AS category_id,
                       c.name AS category_name,
                       c.slug AS category_slug
                FROM products p
                JOIN categories c ON c.id = p.category_id
                """;
    }

    private org.springframework.jdbc.core.RowMapper<AdminProductView> productRowMapper() {
        return (rs, rowNum) -> new AdminProductView(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("slug"),
                rs.getString("short_description"),
                rs.getString("long_description"),
                rs.getBigDecimal("price"),
                rs.getString("currency"),
                rs.getString("material_origin"),
                rs.getString("manufacturing_process"),
                rs.getString("sustainability_impact"),
                rs.getBoolean("is_featured"),
                rs.getBoolean("is_active"),
                rs.getInt("stock_quantity"),
                rs.getLong("category_id"),
                rs.getString("category_name"),
                rs.getString("category_slug")
        );
    }
}
