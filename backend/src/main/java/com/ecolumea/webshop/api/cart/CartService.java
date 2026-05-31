package com.ecolumea.webshop.api.cart;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ecolumea.webshop.pricing.OfferPricingService;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CartService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("30.00");
    private static final BigDecimal SHIPPING_FLAT_RATE = new BigDecimal("4.90");
    private static final String CURRENCY_EUR = "EUR";

    private static final RowMapper<CartItemView> CART_ITEM_MAPPER = (rs, rowNum) -> new CartItemView(
            rs.getLong("id"),
            rs.getString("product_slug"),
            rs.getString("product_name"),
            rs.getInt("quantity"),
            rs.getBigDecimal("unit_price"),
            rs.getBigDecimal("line_total"),
            rs.getString("currency")
    );

    private final JdbcTemplate jdbcTemplate;
        private final OfferPricingService offerPricingService;

        public CartService(JdbcTemplate jdbcTemplate, OfferPricingService offerPricingService) {
        this.jdbcTemplate = jdbcTemplate;
                this.offerPricingService = offerPricingService;
    }

    @Transactional
    public CartResponse getCart(String sessionKey) {
        CartContext context = findOrCreateCartContext(sessionKey);
        return buildCartResponse(context.cartId(), context.sessionKey());
    }

    @Transactional
    public CartResponse addItem(String sessionKey, String productSlug, int quantity) {
        CartContext context = findOrCreateCartContext(sessionKey);

        ProductRef product = findProductBySlug(productSlug);
        Long existingItemId = jdbcTemplate.query(
                """
                SELECT ci.id
                FROM cart_items ci
                WHERE ci.cart_id = ? AND ci.product_id = ?
                LIMIT 1
                """,
                (rs, rowNum) -> rs.getLong("id"),
                context.cartId(),
                product.id()
        ).stream().findFirst().orElse(null);

                if (existingItemId == null) {
                        if (quantity > product.stockQuantity()) {
                                throw new ResponseStatusException(BAD_REQUEST, "Insufficient stock");
                        }
            BigDecimal lineTotal = product.price().multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
            jdbcTemplate.update(
                    """
                    INSERT INTO cart_items (cart_id, product_id, quantity, unit_price_snapshot, line_total_snapshot)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    context.cartId(),
                    product.id(),
                    quantity,
                    product.price(),
                    lineTotal
            );
        } else {
            Integer currentQuantity = jdbcTemplate.queryForObject(
                    "SELECT quantity FROM cart_items WHERE id = ?",
                    Integer.class,
                    existingItemId
            );
            int updatedQuantity = (currentQuantity == null ? 0 : currentQuantity) + quantity;
                        if (updatedQuantity > product.stockQuantity()) {
                                throw new ResponseStatusException(BAD_REQUEST, "Insufficient stock");
                        }
            BigDecimal lineTotal = product.price().multiply(BigDecimal.valueOf(updatedQuantity)).setScale(2, RoundingMode.HALF_UP);
            jdbcTemplate.update(
                    """
                    UPDATE cart_items
                    SET quantity = ?, unit_price_snapshot = ?, line_total_snapshot = ?
                    WHERE id = ?
                    """,
                    updatedQuantity,
                    product.price(),
                    lineTotal,
                    existingItemId
            );
        }

        touchCart(context.cartId());
        return buildCartResponse(context.cartId(), context.sessionKey());
    }

    @Transactional
    public CartResponse updateItemQuantity(String sessionKey, long itemId, int quantity) {
        CartContext context = findOrCreateCartContext(sessionKey);

        CartItemProductRow row = jdbcTemplate.query(
                """
                SELECT ci.id AS cart_item_id, ci.product_id, p.price, p.stock_quantity
                FROM cart_items ci
                JOIN products p ON p.id = ci.product_id
                WHERE ci.id = ? AND ci.cart_id = ?
                LIMIT 1
                """,
                (rs, rowNum) -> new CartItemProductRow(
                        rs.getLong("cart_item_id"),
                        rs.getLong("product_id"),
                        rs.getBigDecimal("price"),
                        rs.getInt("stock_quantity")
                ),
                itemId,
                context.cartId()
        ).stream().findFirst().orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Cart item not found"));

        if (quantity > row.stockQuantity()) {
            throw new ResponseStatusException(BAD_REQUEST, "Insufficient stock");
        }

        BigDecimal lineTotal = row.price().multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
        jdbcTemplate.update(
                """
                UPDATE cart_items
                SET quantity = ?, unit_price_snapshot = ?, line_total_snapshot = ?
                WHERE id = ?
                """,
                quantity,
                row.price(),
                lineTotal,
                row.cartItemId()
        );

        touchCart(context.cartId());
        return buildCartResponse(context.cartId(), context.sessionKey());
    }

    @Transactional
    public CartResponse removeItem(String sessionKey, long itemId) {
        CartContext context = findOrCreateCartContext(sessionKey);
        int deleted = jdbcTemplate.update(
                "DELETE FROM cart_items WHERE id = ? AND cart_id = ?",
                itemId,
                context.cartId()
        );
        if (deleted == 0) {
            throw new ResponseStatusException(NOT_FOUND, "Cart item not found");
        }

        touchCart(context.cartId());
        return buildCartResponse(context.cartId(), context.sessionKey());
    }

    private ProductRef findProductBySlug(String productSlug) {
        return jdbcTemplate.query(
                """
                SELECT p.id, p.price, p.stock_quantity
                FROM products p
                WHERE p.is_active = 1 AND lower(p.slug) = lower(?)
                LIMIT 1
                """,
                (rs, rowNum) -> new ProductRef(
                        rs.getLong("id"),
                        rs.getBigDecimal("price"),
                        rs.getInt("stock_quantity")
                ),
                productSlug
        ).stream().findFirst().orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));
    }

    private CartResponse buildCartResponse(long cartId, String sessionKey) {
        List<CartItemView> items = jdbcTemplate.query(
                """
                SELECT ci.id,
                       p.slug AS product_slug,
                       p.name AS product_name,
                       ci.quantity,
                       ci.unit_price_snapshot AS unit_price,
                       ci.line_total_snapshot AS line_total,
                       p.currency
                FROM cart_items ci
                JOIN products p ON p.id = ci.product_id
                WHERE ci.cart_id = ?
                ORDER BY ci.id ASC
                """,
                CART_ITEM_MAPPER,
                cartId
        );

        if (items.isEmpty()) {
            BigDecimal zeroAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            return new CartResponse(
                    cartId,
                    sessionKey,
                    items,
                    zeroAmount,
                    zeroAmount,
                    null,
                    zeroAmount,
                    zeroAmount,
                    CURRENCY_EUR,
                    FREE_SHIPPING_THRESHOLD,
                    false
            );
        }

        List<CartPricingLine> pricingLines = jdbcTemplate.query(
                """
                SELECT p.id AS product_id,
                       p.category_id,
                       ci.line_total_snapshot AS line_total
                FROM cart_items ci
                JOIN products p ON p.id = ci.product_id
                WHERE ci.cart_id = ?
                """,
                (rs, rowNum) -> new CartPricingLine(
                        rs.getLong("product_id"),
                        rs.getLong("category_id"),
                        rs.getBigDecimal("line_total")
                ),
                cartId
        );

        BigDecimal subtotal = items.stream()
                .map(CartItemView::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        OfferPricingService.DiscountResult discountResult = offerPricingService.calculateBestDiscount(
                pricingLines.stream()
                        .map(line -> new OfferPricingService.PricingLine(line.productId(), line.categoryId(), line.lineTotal()))
                        .toList()
        );

        BigDecimal discount = discountResult.discountAmount();
        BigDecimal subtotalAfterDiscount = subtotal.subtract(discount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        boolean freeShippingReached = subtotalAfterDiscount.compareTo(FREE_SHIPPING_THRESHOLD) >= 0;
        BigDecimal shipping = freeShippingReached ? BigDecimal.ZERO : SHIPPING_FLAT_RATE;
        BigDecimal total = subtotalAfterDiscount.add(shipping).setScale(2, RoundingMode.HALF_UP);

        return new CartResponse(
                cartId,
                sessionKey,
                items,
                subtotal,
                discount,
                discountResult.offerName(),
                shipping,
                total,
                CURRENCY_EUR,
                FREE_SHIPPING_THRESHOLD,
                freeShippingReached
        );
    }

    private CartContext findOrCreateCartContext(String rawSessionKey) {
        String sessionKey = (rawSessionKey == null || rawSessionKey.isBlank()) ? UUID.randomUUID().toString() : rawSessionKey;

        Long existingCartId = jdbcTemplate.query(
                """
                SELECT c.id
                FROM carts c
                WHERE c.status = 'ACTIVE' AND c.session_key = ?
                LIMIT 1
                """,
                (rs, rowNum) -> rs.getLong("id"),
                sessionKey
        ).stream().findFirst().orElse(null);

        if (existingCartId != null) {
            return new CartContext(existingCartId, sessionKey);
        }

        jdbcTemplate.update(
                """
                INSERT INTO carts (session_key, status)
                VALUES (?, 'ACTIVE')
                """,
                sessionKey
        );

        Long createdId = jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
        if (createdId == null) {
            throw new IllegalStateException("Could not create cart");
        }
        return new CartContext(createdId, sessionKey);
    }

    private void touchCart(long cartId) {
        jdbcTemplate.update(
                "UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                cartId
        );
    }

    private record CartContext(long cartId, String sessionKey) {
    }

        private record ProductRef(long id, BigDecimal price, int stockQuantity) {
    }

        private record CartItemProductRow(long cartItemId, long productId, BigDecimal price, int stockQuantity) {
    }

        private record CartPricingLine(long productId, long categoryId, BigDecimal lineTotal) {
        }
}
