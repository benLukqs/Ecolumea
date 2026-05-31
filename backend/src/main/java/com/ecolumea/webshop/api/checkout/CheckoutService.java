package com.ecolumea.webshop.api.checkout;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ecolumea.webshop.pricing.OfferPricingService;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CheckoutService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("30.00");
    private static final BigDecimal SHIPPING_FLAT_RATE = new BigDecimal("4.90");
    private static final String ORDER_STATUS_PLACED = "PLACED";
    private static final String PAYMENT_STATUS_SIMULATED_PAID = "SIMULATED_PAID";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.BASIC_ISO_DATE;

    private final JdbcTemplate jdbcTemplate;
        private final OfferPricingService offerPricingService;

        public CheckoutService(JdbcTemplate jdbcTemplate, OfferPricingService offerPricingService) {
        this.jdbcTemplate = jdbcTemplate;
                this.offerPricingService = offerPricingService;
    }

    @Transactional
        public OrderConfirmationResponse placeOrder(PlaceOrderRequest request, Long userId) {
                if (userId == null && !Boolean.TRUE.equals(request.privacyAccepted())) {
                        throw new ResponseStatusException(BAD_REQUEST, "Datenschutz muss akzeptiert werden");
                }
        Long cartId = findActiveCartId(request.sessionKey());
        if (cartId == null) {
            throw new ResponseStatusException(NOT_FOUND, "Active cart not found for session");
        }

        List<CartLine> cartLines = jdbcTemplate.query(
                """
                SELECT ci.product_id,
                          p.category_id,
                       p.name AS product_name,
                       ci.quantity,
                       ci.unit_price_snapshot,
                       ci.line_total_snapshot,
                       p.currency
                FROM cart_items ci
                JOIN products p ON p.id = ci.product_id
                WHERE ci.cart_id = ?
                ORDER BY ci.id ASC
                """,
                (rs, rowNum) -> new CartLine(
                        rs.getLong("product_id"),
                        rs.getLong("category_id"),
                        rs.getString("product_name"),
                        rs.getInt("quantity"),
                        rs.getBigDecimal("unit_price_snapshot"),
                        rs.getBigDecimal("line_total_snapshot"),
                        rs.getString("currency")
                ),
                cartId
        );

        if (cartLines.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Cart is empty");
        }

                for (CartLine line : cartLines) {
                        int updated = jdbcTemplate.update(
                                        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?",
                                        line.quantity(),
                                        line.productId(),
                                        line.quantity()
                        );
                        if (updated == 0) {
                                throw new ResponseStatusException(BAD_REQUEST, "Insufficient stock for " + line.productName());
                        }
                }

        BigDecimal subtotal = cartLines.stream()
                .map(CartLine::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        OfferPricingService.DiscountResult discountResult = offerPricingService.calculateBestDiscount(
                cartLines.stream()
                        .map(line -> new OfferPricingService.PricingLine(line.productId(), line.categoryId(), line.lineTotal()))
                        .toList()
        );

        BigDecimal discount = discountResult.discountAmount();
        BigDecimal subtotalAfterDiscount = subtotal.subtract(discount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        BigDecimal shipping = subtotalAfterDiscount.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : SHIPPING_FLAT_RATE;

        BigDecimal total = subtotalAfterDiscount.add(shipping).setScale(2, RoundingMode.HALF_UP);
        String currency = cartLines.getFirst().currency();
        String orderNumber = generateOrderNumber();
        String guestEmail = resolveGuestEmail(request, userId);

        jdbcTemplate.update(
                """
                INSERT INTO orders (
                  order_number,
                  user_id,
                  guest_email,
                  shipping_address_snapshot,
                  billing_address_snapshot,
                  subtotal_amount,
                  shipping_amount,
                  discount_amount,
                  total_amount,
                  currency,
                  order_status,
                  payment_status,
                  shipping_provider
                )
                                                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                orderNumber,
                userId,
                guestEmail,
                request.shippingAddressSnapshot(),
                request.billingAddressSnapshot(),
                subtotal,
                shipping,
                discount,
                total,
                currency,
                ORDER_STATUS_PLACED,
                PAYMENT_STATUS_SIMULATED_PAID,
                request.shippingProvider()
        );

        Long orderId = jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
        if (orderId == null) {
            throw new IllegalStateException("Order creation failed");
        }

        for (CartLine line : cartLines) {
            jdbcTemplate.update(
                    """
                    INSERT INTO order_items (
                      order_id,
                      product_id,
                      product_name_snapshot,
                      unit_price_snapshot,
                      quantity,
                      line_total_snapshot
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    orderId,
                    line.productId(),
                    line.productName(),
                    line.unitPrice(),
                    line.quantity(),
                    line.lineTotal()
            );
        }


        jdbcTemplate.update("DELETE FROM cart_items WHERE cart_id = ?", cartId);
        jdbcTemplate.update(
                "UPDATE carts SET status = 'CHECKED_OUT', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                cartId
        );

        return new OrderConfirmationResponse(
                orderId,
                orderNumber,
                total,
                currency,
                ORDER_STATUS_PLACED,
                PAYMENT_STATUS_SIMULATED_PAID,
                request.shippingProvider()
        );
    }

    private Long findActiveCartId(String sessionKey) {
        return jdbcTemplate.query(
                """
                SELECT c.id
                FROM carts c
                WHERE c.status = 'ACTIVE' AND c.session_key = ?
                LIMIT 1
                """,
                (rs, rowNum) -> rs.getLong("id"),
                sessionKey
        ).stream().findFirst().orElse(null);
    }

        private String resolveGuestEmail(PlaceOrderRequest request, Long userId) {
                if (userId != null) {
                        return jdbcTemplate.query(
                                        "SELECT email FROM users WHERE id = ? LIMIT 1",
                                        (rs, rowNum) -> rs.getString("email"),
                                        userId
                        ).stream().findFirst().orElse(request.guestEmail());
                }
                return request.guestEmail();
        }

    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DATE_FORMAT);
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "EC-" + datePart + "-" + randomPart;
    }

    private record CartLine(
            long productId,
            long categoryId,
            String productName,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal,
            String currency
    ) {
    }
}
