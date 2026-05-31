package com.ecolumea.webshop.api.admin.order;

import java.util.List;
import java.util.Set;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AdminOrderService {

        private static final Set<String> ALLOWED_STATUSES = Set.of(
                        "PLACED",
                        "PROCESSING",
                        "SHIPPED",
                        "DELIVERED",
                        "CANCELED"
        );

    private final JdbcTemplate jdbcTemplate;

    public AdminOrderService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AdminOrderListItem> getOrders() {
        return jdbcTemplate.query(
                """
                SELECT o.id,
                       o.order_number,
                       o.guest_email,
                       o.total_amount,
                       o.currency,
                       o.order_status,
                       o.payment_status,
                       o.shipping_provider,
                       o.created_at
                FROM orders o
                ORDER BY o.created_at DESC, o.id DESC
                """,
                (rs, rowNum) -> new AdminOrderListItem(
                        rs.getLong("id"),
                        rs.getString("order_number"),
                        rs.getString("guest_email"),
                        rs.getBigDecimal("total_amount"),
                        rs.getString("currency"),
                        rs.getString("order_status"),
                        rs.getString("payment_status"),
                        rs.getString("shipping_provider"),
                        rs.getString("created_at")
                )
        );
    }

    public AdminOrderDetailResponse getOrderById(long id) {
        List<AdminOrderDetailResponse> orderRows = jdbcTemplate.query(
                """
                SELECT o.id,
                       o.order_number,
                       o.guest_email,
                       o.shipping_address_snapshot,
                       o.billing_address_snapshot,
                       o.subtotal_amount,
                       o.shipping_amount,
                       o.discount_amount,
                       o.total_amount,
                       o.currency,
                       o.order_status,
                       o.payment_status,
                       o.shipping_provider,
                       o.created_at
                FROM orders o
                WHERE o.id = ?
                LIMIT 1
                """,
                (rs, rowNum) -> new AdminOrderDetailResponse(
                        rs.getLong("id"),
                        rs.getString("order_number"),
                        rs.getString("guest_email"),
                        rs.getString("shipping_address_snapshot"),
                        rs.getString("billing_address_snapshot"),
                        rs.getBigDecimal("subtotal_amount"),
                        rs.getBigDecimal("shipping_amount"),
                        rs.getBigDecimal("discount_amount"),
                        rs.getBigDecimal("total_amount"),
                        rs.getString("currency"),
                        rs.getString("order_status"),
                        rs.getString("payment_status"),
                        rs.getString("shipping_provider"),
                        rs.getString("created_at"),
                        List.of()
                ),
                id
        );

        if (orderRows.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "Order not found");
        }

        AdminOrderDetailResponse base = orderRows.getFirst();
        List<AdminOrderItemView> items = jdbcTemplate.query(
                """
                SELECT oi.id,
                       oi.product_name_snapshot,
                       oi.quantity,
                       oi.unit_price_snapshot,
                       oi.line_total_snapshot
                FROM order_items oi
                WHERE oi.order_id = ?
                ORDER BY oi.id ASC
                """,
                (rs, rowNum) -> new AdminOrderItemView(
                        rs.getLong("id"),
                        rs.getString("product_name_snapshot"),
                        rs.getInt("quantity"),
                        rs.getBigDecimal("unit_price_snapshot"),
                        rs.getBigDecimal("line_total_snapshot")
                ),
                id
        );

        return new AdminOrderDetailResponse(
                base.id(),
                base.orderNumber(),
                base.guestEmail(),
                base.shippingAddressSnapshot(),
                base.billingAddressSnapshot(),
                base.subtotalAmount(),
                base.shippingAmount(),
                base.discountAmount(),
                base.totalAmount(),
                base.currency(),
                base.orderStatus(),
                base.paymentStatus(),
                base.shippingProvider(),
                base.createdAt(),
                items
        );
    }

        @Transactional
        public AdminOrderDetailResponse updateOrderStatus(long id, String newOrderStatusRaw) {
                String normalizedStatus = normalizeStatus(newOrderStatusRaw);

                List<String> currentStatusRows = jdbcTemplate.query(
                                """
                                SELECT o.order_status
                                FROM orders o
                                WHERE o.id = ?
                                LIMIT 1
                                """,
                                (rs, rowNum) -> rs.getString("order_status"),
                                id
                );

                if (currentStatusRows.isEmpty()) {
                        throw new ResponseStatusException(NOT_FOUND, "Order not found");
                }

                String previousStatus = currentStatusRows.getFirst();
                if (!previousStatus.equals(normalizedStatus)) {
                        jdbcTemplate.update(
                                        """
                                        UPDATE orders
                                        SET order_status = ?, updated_at = CURRENT_TIMESTAMP
                                        WHERE id = ?
                                        """,
                                        normalizedStatus,
                                        id
                        );

                }

                return getOrderById(id);
        }

        private String normalizeStatus(String statusRaw) {
                if (statusRaw == null || statusRaw.isBlank()) {
                        throw new ResponseStatusException(BAD_REQUEST, "Order status is required");
                }

                String normalized = statusRaw.trim().toUpperCase();
                if (!ALLOWED_STATUSES.contains(normalized)) {
                        throw new ResponseStatusException(BAD_REQUEST, "Unsupported order status");
                }
                return normalized;
        }
}
