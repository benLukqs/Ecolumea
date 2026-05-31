-- Sample/Demo Data for Development
-- Includes orders and offers

-- Guest order (kein User)
INSERT INTO orders (
  order_number, guest_email, shipping_address_snapshot, billing_address_snapshot,
  subtotal_amount, shipping_amount, discount_amount, total_amount,
  currency, order_status, payment_status, shipping_provider
)
VALUES
  (
    'ORD-2026-002',
    'guest@example.com',
    'Teststraße 1, 10115 Berlin, DE',
    'Teststraße 1, 10115 Berlin, DE',
    249.00, 0.00, 0.00, 249.00,
    'EUR', 'PENDING', 'PENDING', 'DHL'
  );

INSERT INTO order_items (order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, line_total_snapshot)
VALUES
  ((SELECT id FROM orders WHERE order_number = 'ORD-2026-002'),
    (SELECT id FROM products WHERE slug = 'flaschenlampe-aus-bierflasche'),
    'Flaschenlampe aus Bierflasche', 249.00, 1, 249.00);

-- Order status history removed.

-- Sample Offers
INSERT INTO offers (name, description, discount_type, discount_value, target_type, target_category_id, target_product_id, teaser_text, is_active)
VALUES
  ('Möbel Rabatt 10%', 'Rabatt auf Möbel-Kategorie', 'PERCENTAGE', 10, 'CATEGORY', 
   (SELECT id FROM categories WHERE slug = 'moebel'), NULL, '10% Rabatt auf Möbel', 1),
  ('Flaschenlampe Spezial', 'Besonderes Angebot für die Flaschenlampe', 'FIXED_AMOUNT', 30, 'PRODUCT',
   NULL, (SELECT id FROM products WHERE slug = 'flaschenlampe-aus-bierflasche'), 'EUR 30 Rabatt', 1),
  ('Beleuchtungs-Sale', 'Reduzierte Lichtobjekte', 'PERCENTAGE', 15, 'CATEGORY',
   (SELECT id FROM categories WHERE slug = 'beleuchtung'), NULL, '15% auf Beleuchtung', 1);

-- Media assets removed.


