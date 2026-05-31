INSERT INTO categories (name, slug, description, sustainability_aspect, sort_order, is_active)
VALUES
  ('Möbel', 'moebel', 'Einzigartige Möbelstücke aus wiederverwendeten Materialien', 'Reclaimed wood, langlebige Verarbeitung', 1, 1),
  ('Deko', 'deko', 'Kleine Objekte mit starker Präsenz.', 'Upcycling, reduzierte Materialmenge', 2, 1),
  ('Beleuchtung', 'beleuchtung', 'Funktionale Beleuchtung mit Charakter.', 'Energieeffizienz und Reparierbarkeit', 3, 1),
  ('Accessoires', 'accessoires', 'Praktische Begleiter aus wiederverwendeten Materialien.', 'Textilreste und robuste Beschläge werden neu genutzt', 4, 1);

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
VALUES
  (
    (SELECT id FROM categories WHERE slug = 'beleuchtung'),
    'Flaschenlampe aus Bierflasche',
    'flaschenlampe-aus-bierflasche',
    'Upcycling-Tischlampe mit warmem Leinenschirm.',
    'Eine handgefertigte Tischleuchte aus einer wiederverwendeten Bierflasche mit natürlichem Schirm. Sie bringt warmes, indirektes Licht in Wohn- und Lesebereiche.',
    249.00,
    'EUR',
    'Wiederverwendete Glasflasche, Leinen, Holzsockel',
    'Handmontiert und neu verkabelt',
    'Bestehende Materialien werden in ein langlebiges Lichtobjekt verwandelt.',
    1,
    1,
    10
  ),
  (
    (SELECT id FROM categories WHERE slug = 'accessoires'),
    'Messenger Bag aus Denim und Kaffeesack',
    'messenger-bag-aus-denim-und-kaffeesack',
    'Robuste Tasche aus recyceltem Denim und Jute.',
    'Die Tasche kombiniert ausgediente Jeansstoffe mit einem Kaffeesack-Frontpanel und verstärkten Nähten. Sie ist leicht, strapazierfähig und alltagstauglich.',
    129.00,
    'EUR',
    'Recycelter Denim und Jute',
    'Sorgfältig zugeschnitten und verstärkt',
    'Textilreste werden zu einem langlebigen Alltagsbegleiter.',
    0,
    1,
    10
  ),
  (
    (SELECT id FROM categories WHERE slug = 'deko'),
    'Organische Schale',
    'organische-schale',
    'Skulpturale Schale mit matter Tiefe.',
    'Eine schwarz glasierte Schale mit fließender Kontur für Obst, Nüsse oder als ruhiges Einzelobjekt auf Tisch und Regal.',
    89.00,
    'EUR',
    'Keramik',
    'Von Hand geformt und gebrannt',
    'Kleine Serie mit langlebiger Glasur und wenig Ausschuss.',
    0,
    1,
    10
  ),
  (
    (SELECT id FROM categories WHERE slug = 'moebel'),
    'Couchtisch aus Stahl und Holz',
    'couchtisch-aus-stahl-und-holz',
    'Industriecharakter trifft wohnliche Oberfläche.',
    'Ein markanter Couchtisch mit weißer Metallschale und warmer Holzplatte. Die Konstruktion wirkt leicht, bleibt aber robust und alltagstauglich.',
    1290.00,
    'EUR',
    'Stahl, pulverbeschichtetes Metall und Holz',
    'Kombination aus Metallverarbeitung und Möbelbau',
    'Langlebige Konstruktion mit reparierbaren Einzelteilen.',
    1,
    1,
    10
  ),
  (
    (SELECT id FROM categories WHERE slug = 'deko'),
    'Wanduhr aus Altholz',
    'wanduhr-aus-altholz',
    'Große Wanduhr mit lebendiger Holzoberfläche.',
    'Die Uhr aus wiederverwendeten Holzbrettern bringt Struktur und Ruhe in den Raum und setzt mit den großen Ziffern einen klaren Akzent.',
    159.00,
    'EUR',
    'Wiederverwendetes Holz',
    'Zusammengefügt und fein geschliffen',
    'Altholz bekommt eine neue, langlebige Nutzung.',
    0,
    1,
    10
  ),
  (
    (SELECT id FROM categories WHERE slug = 'moebel'),
    'Weinregal aus Metall und Holz',
    'weinregal-aus-metall-und-holz',
    'Kompaktes Regal für Flaschen und Gläser.',
    'Das Regal bietet platzsparende Lagerung für Weinflaschen und Gläser und kombiniert eine geformte Metallhülle mit einer warmen Holzauflage.',
    790.00,
    'EUR',
    'Stahlblech und Massivholz',
    'Präzise gekantet und montiert',
    'Robuste Materialien für eine lange Nutzungsdauer.',
    1,
    1,
    10
  );

INSERT INTO product_images (
  product_id,
  file_path,
  title,
  alt_text,
  sort_order,
  is_primary
)
VALUES
  ((SELECT id FROM products WHERE slug = 'flaschenlampe-aus-bierflasche'), 'bierLampe.png', 'Flaschenlampe aus Bierflasche', 'Upcycling-Tischlampe aus Glasflasche mit Leinenschirm', 0, 1),
  ((SELECT id FROM products WHERE slug = 'messenger-bag-aus-denim-und-kaffeesack'), 'jeansTasche.png', 'Messenger Bag aus Denim und Kaffeesack', 'Messenger-Tasche aus Denim und Kaffeesack', 0, 1),
  ((SELECT id FROM products WHERE slug = 'organische-schale'), 'schale.png', 'Organische Schale', 'Schwarze Schale mit organischer Kontur', 0, 1),
  ((SELECT id FROM products WHERE slug = 'couchtisch-aus-stahl-und-holz'), 'tisch.png', 'Couchtisch aus Stahl und Holz', 'Couchtisch mit weißer Metallschale und Holzplatte', 0, 1),
  ((SELECT id FROM products WHERE slug = 'wanduhr-aus-altholz'), 'uhr.png', 'Wanduhr aus Altholz', 'Wanduhr aus wiederverwendeten Holzbrettern', 0, 1),
  ((SELECT id FROM products WHERE slug = 'weinregal-aus-metall-und-holz'), 'wein.png', 'Weinregal aus Metall und Holz', 'Weinregal mit Metallgehäuse und Holzoberfläche', 0, 1);
