package com.ecolumea.webshop.api.admin.offer;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AdminOfferService {

    private final JdbcTemplate jdbcTemplate;

    public AdminOfferService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AdminOfferView> getOffers() {
        return jdbcTemplate.query(
                """
                SELECT o.id,
                       o.name,
                       o.description,
                       o.discount_type,
                       o.discount_value,
                       o.target_type,
                       o.target_category_id,
                       o.target_product_id,
                       o.teaser_text,
                       o.starts_at,
                       o.ends_at,
                       o.is_active
                FROM offers o
                ORDER BY o.updated_at DESC, o.id DESC
                """,
                (rs, rowNum) -> new AdminOfferView(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getString("discount_type"),
                        rs.getBigDecimal("discount_value"),
                        rs.getString("target_type"),
                    toNullableLong(rs.getObject("target_category_id")),
                    toNullableLong(rs.getObject("target_product_id")),
                        rs.getString("teaser_text"),
                        rs.getString("starts_at"),
                        rs.getString("ends_at"),
                        rs.getBoolean("is_active")
                )
        );
    }

    public AdminOfferView getOfferById(long id) {
        List<AdminOfferView> rows = jdbcTemplate.query(
                """
                SELECT o.id,
                       o.name,
                       o.description,
                       o.discount_type,
                       o.discount_value,
                       o.target_type,
                       o.target_category_id,
                       o.target_product_id,
                       o.teaser_text,
                       o.starts_at,
                       o.ends_at,
                       o.is_active
                FROM offers o
                WHERE o.id = ?
                LIMIT 1
                """,
                (rs, rowNum) -> new AdminOfferView(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getString("discount_type"),
                        rs.getBigDecimal("discount_value"),
                        rs.getString("target_type"),
                    toNullableLong(rs.getObject("target_category_id")),
                    toNullableLong(rs.getObject("target_product_id")),
                        rs.getString("teaser_text"),
                        rs.getString("starts_at"),
                        rs.getString("ends_at"),
                        rs.getBoolean("is_active")
                ),
                id
        );

        if (rows.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "Offer not found");
        }
        return rows.getFirst();
    }

    @Transactional
    public AdminOfferView createOffer(AdminOfferUpsertRequest request) {
        ValidatedTarget target = validateTarget(request.targetType(), request.targetCategoryId(), request.targetProductId());

        jdbcTemplate.update(
                """
                INSERT INTO offers (
                  name,
                  description,
                  discount_type,
                  discount_value,
                  target_type,
                  target_category_id,
                  target_product_id,
                  teaser_text,
                  starts_at,
                  ends_at,
                  is_active
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                request.name(),
                request.description(),
                normalizeDiscountType(request.discountType()),
                request.discountValue(),
                target.targetType(),
                target.targetCategoryId(),
                target.targetProductId(),
                request.teaserText(),
                emptyToNull(request.startsAt()),
                emptyToNull(request.endsAt()),
                request.active()
        );

        Long id = jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
        if (id == null) {
            throw new IllegalStateException("Offer creation failed");
        }
        return getOfferById(id);
    }

    @Transactional
    public AdminOfferView updateOffer(long id, AdminOfferUpsertRequest request) {
        ValidatedTarget target = validateTarget(request.targetType(), request.targetCategoryId(), request.targetProductId());

        int updated = jdbcTemplate.update(
                """
                UPDATE offers
                SET name = ?,
                    description = ?,
                    discount_type = ?,
                    discount_value = ?,
                    target_type = ?,
                    target_category_id = ?,
                    target_product_id = ?,
                    teaser_text = ?,
                    starts_at = ?,
                    ends_at = ?,
                    is_active = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                request.name(),
                request.description(),
                normalizeDiscountType(request.discountType()),
                request.discountValue(),
                target.targetType(),
                target.targetCategoryId(),
                target.targetProductId(),
                request.teaserText(),
                emptyToNull(request.startsAt()),
                emptyToNull(request.endsAt()),
                request.active(),
                id
        );

        if (updated == 0) {
            throw new ResponseStatusException(NOT_FOUND, "Offer not found");
        }
        return getOfferById(id);
    }

    private ValidatedTarget validateTarget(String targetTypeRaw, Long targetCategoryId, Long targetProductId) {
        String targetType = targetTypeRaw == null ? "" : targetTypeRaw.trim().toUpperCase();
        return switch (targetType) {
            case "CATEGORY" -> {
                if (targetCategoryId == null || targetProductId != null) {
                    throw new ResponseStatusException(BAD_REQUEST, "CATEGORY target requires targetCategoryId only");
                }
                yield new ValidatedTarget("CATEGORY", targetCategoryId, null);
            }
            case "PRODUCT" -> {
                if (targetProductId == null || targetCategoryId != null) {
                    throw new ResponseStatusException(BAD_REQUEST, "PRODUCT target requires targetProductId only");
                }
                yield new ValidatedTarget("PRODUCT", null, targetProductId);
            }
            default -> throw new ResponseStatusException(BAD_REQUEST, "Unsupported target type");
        };
    }

    private String normalizeDiscountType(String discountTypeRaw) {
        String discountType = discountTypeRaw == null ? "" : discountTypeRaw.trim().toUpperCase();
        return switch (discountType) {
            case "PERCENT", "PERCENTAGE" -> "PERCENTAGE";
            case "FIXED", "AMOUNT" -> "FIXED";
            default -> throw new ResponseStatusException(BAD_REQUEST, "Unsupported discount type");
        };
    }

    private String emptyToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value;
    }

    private Long toNullableLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.valueOf(value.toString());
    }

    private record ValidatedTarget(String targetType, Long targetCategoryId, Long targetProductId) {
    }
}
