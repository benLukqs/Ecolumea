package com.ecolumea.webshop.api.admin.category;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AdminCategoryService {

    private final JdbcTemplate jdbcTemplate;

    public AdminCategoryService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AdminCategoryView> getCategories() {
        return jdbcTemplate.query(
                """
                SELECT c.id,
                       c.name,
                       c.slug,
                       c.description,
                       c.sustainability_aspect,
                       c.sort_order,
                       c.is_active
                FROM categories c
                ORDER BY c.sort_order ASC, c.name ASC
                """,
                (rs, rowNum) -> new AdminCategoryView(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("slug"),
                        rs.getString("description"),
                        rs.getString("sustainability_aspect"),
                        rs.getInt("sort_order"),
                        rs.getBoolean("is_active")
                )
        );
    }

    public AdminCategoryView getCategoryById(long id) {
        List<AdminCategoryView> rows = jdbcTemplate.query(
                """
                SELECT c.id,
                       c.name,
                       c.slug,
                       c.description,
                       c.sustainability_aspect,
                       c.sort_order,
                       c.is_active
                FROM categories c
                WHERE c.id = ?
                LIMIT 1
                """,
                (rs, rowNum) -> new AdminCategoryView(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("slug"),
                        rs.getString("description"),
                        rs.getString("sustainability_aspect"),
                        rs.getInt("sort_order"),
                        rs.getBoolean("is_active")
                ),
                id
        );

        if (rows.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "Category not found");
        }
        return rows.getFirst();
    }

    @Transactional
    public AdminCategoryView createCategory(AdminCategoryUpsertRequest request) {
        jdbcTemplate.update(
                """
                INSERT INTO categories (
                  name,
                  slug,
                  description,
                  sustainability_aspect,
                  sort_order,
                  is_active
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                request.name(),
                request.slug(),
                request.description(),
                request.sustainabilityAspect(),
                request.sortOrder(),
                request.active()
        );

        Long id = jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
        if (id == null) {
            throw new IllegalStateException("Category creation failed");
        }
        return getCategoryById(id);
    }

    @Transactional
    public AdminCategoryView updateCategory(long id, AdminCategoryUpsertRequest request) {
        int updated = jdbcTemplate.update(
                """
                UPDATE categories
                SET name = ?,
                    slug = ?,
                    description = ?,
                    sustainability_aspect = ?,
                    sort_order = ?,
                    is_active = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                request.name(),
                request.slug(),
                request.description(),
                request.sustainabilityAspect(),
                request.sortOrder(),
                request.active(),
                id
        );

        if (updated == 0) {
            throw new ResponseStatusException(NOT_FOUND, "Category not found");
        }
        return getCategoryById(id);
    }
}
