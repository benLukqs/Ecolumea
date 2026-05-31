INSERT INTO roles (code, name, description, is_active)
VALUES
  ('ADMIN_PRODUCT', 'Product Admin', 'Can manage products, categories, offers, and media', 1),
  ('ADMIN_ORDER', 'Order Admin', 'Can manage order overview and status updates', 1),
  ('SUPER_ADMIN', 'Super Admin', 'Can manage all admin capabilities', 1)
ON CONFLICT(code) DO NOTHING;
