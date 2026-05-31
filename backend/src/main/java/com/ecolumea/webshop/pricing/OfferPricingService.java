package com.ecolumea.webshop.pricing;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class OfferPricingService {

    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private final JdbcTemplate jdbcTemplate;

    public OfferPricingService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public DiscountResult calculateBestDiscount(List<PricingLine> lines) {
        if (lines.isEmpty()) {
            return new DiscountResult(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), null);
        }

        List<OfferRow> offers = jdbcTemplate.query(
                """
                SELECT o.id,
                       o.name,
                       o.discount_type,
                       o.discount_value,
                       o.target_type,
                       o.target_category_id,
                       o.target_product_id
                FROM offers o
                WHERE o.is_active = 1
                  AND (o.starts_at IS NULL OR o.starts_at <= CURRENT_TIMESTAMP)
                  AND (o.ends_at IS NULL OR o.ends_at >= CURRENT_TIMESTAMP)
                """,
                (rs, rowNum) -> new OfferRow(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("discount_type"),
                        rs.getBigDecimal("discount_value"),
                        rs.getString("target_type"),
                    toNullableLong(rs.getObject("target_category_id")),
                    toNullableLong(rs.getObject("target_product_id"))
                )
        );

        BigDecimal bestDiscount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        String bestOfferName = null;

        for (OfferRow offer : offers) {
            BigDecimal eligibleSubtotal = lines.stream()
                    .filter(line -> matchesTarget(line, offer))
                    .map(PricingLine::lineTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .setScale(2, RoundingMode.HALF_UP);

            if (eligibleSubtotal.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal discount = calculateDiscount(offer.discountType(), offer.discountValue(), eligibleSubtotal);
            if (discount.compareTo(bestDiscount) > 0) {
                bestDiscount = discount;
                bestOfferName = offer.name();
            }
        }

        return new DiscountResult(bestDiscount, bestOfferName);
    }

    private boolean matchesTarget(PricingLine line, OfferRow offer) {
        String targetType = offer.targetType() == null ? "" : offer.targetType().trim().toUpperCase();
        return switch (targetType) {
            case "PRODUCT" -> offer.targetProductId() != null && offer.targetProductId().equals(line.productId());
            case "CATEGORY" -> offer.targetCategoryId() != null && offer.targetCategoryId().equals(line.categoryId());
            default -> false;
        };
    }

    private BigDecimal calculateDiscount(String discountTypeRaw, BigDecimal discountValue, BigDecimal eligibleSubtotal) {
        String discountType = discountTypeRaw == null ? "" : discountTypeRaw.trim().toUpperCase();
        BigDecimal computed = switch (discountType) {
            case "PERCENT", "PERCENTAGE" -> eligibleSubtotal
                    .multiply(discountValue)
                    .divide(HUNDRED, 2, RoundingMode.HALF_UP);
            case "FIXED", "AMOUNT" -> discountValue.setScale(2, RoundingMode.HALF_UP);
            default -> BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        };

        if (computed.compareTo(eligibleSubtotal) > 0) {
            return eligibleSubtotal;
        }
        if (computed.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return computed.setScale(2, RoundingMode.HALF_UP);
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

    public record PricingLine(long productId, long categoryId, BigDecimal lineTotal) {
    }

    public record DiscountResult(BigDecimal discountAmount, String offerName) {
    }

    private record OfferRow(
            long id,
            String name,
            String discountType,
            BigDecimal discountValue,
            String targetType,
            Long targetCategoryId,
            Long targetProductId
    ) {
    }
}
