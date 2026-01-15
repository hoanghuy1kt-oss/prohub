-- ============================================
-- MIGRATE PROJECTS DATA FROM HARDCODED TO SUPABASE
-- ============================================
-- Chạy script này trong Supabase SQL Editor để import tất cả projects từ Projects.jsx

-- 1. EXHIBITION PROJECTS (4 projects)
INSERT INTO projects (category_id, title, location, external_content, images, layout, order_index)
SELECT 
  (SELECT id FROM project_categories WHERE slug = 'exhibition' LIMIT 1),
  'VTDF @ITE 2022',
  'Ho Chi Minh City',
  jsonb_build_object(
    'projectName', 'VTDF @ITE 2022',
    'shortDescription', '',
    'highlights', ''
  ),
  ARRAY['https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=2070&auto=format&fit=crop'],
  'portrait',
  0
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'VTDF @ITE 2022');

INSERT INTO projects (category_id, title, location, external_content, images, layout, order_index)
SELECT 
  (SELECT id FROM project_categories WHERE slug = 'exhibition' LIMIT 1),
  'Viglacera Booth',
  'Vietbuild Hanoi',
  jsonb_build_object(
    'projectName', 'Viglacera Booth',
    'shortDescription', '',
    'highlights', ''
  ),
  ARRAY['https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop'],
  'portrait',
  1
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Viglacera Booth');

INSERT INTO projects (category_id, title, location, external_content, images, layout, order_index)
SELECT 
  (SELECT id FROM project_categories WHERE slug = 'exhibition' LIMIT 1),
  'Korea Tourism Org',
  'VITM Danang',
  jsonb_build_object(
    'projectName', 'Korea Tourism Org',
    'shortDescription', '',
    'highlights', ''
  ),
  ARRAY['https://images.unsplash.com/photo-1540575467063-17ea6f5cc656?q=80&w=2070&auto=format&fit=crop'],
  'portrait',
  2
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Korea Tourism Org');

INSERT INTO projects (category_id, title, location, external_content, images, layout, order_index)
SELECT 
  (SELECT id FROM project_categories WHERE slug = 'exhibition' LIMIT 1),
  'Panasonic Tech',
  'CES Local',
  jsonb_build_object(
    'projectName', 'Panasonic Tech',
    'shortDescription', '',
    'highlights', ''
  ),
  ARRAY['https://images.unsplash.com/photo-1550305080-4e029753abcf?q=80&w=2071&auto=format&fit=crop'],
  'portrait',
  3
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Panasonic Tech');

-- 2. EVENTS PROJECTS (3 projects)
INSERT INTO projects (category_id, title, location, year, external_content, images, layout, order_index)
SELECT 
  (SELECT id FROM project_categories WHERE slug = 'events' LIMIT 1),
  'Diageo Kick-off Meeting',
  'Quy Nhon',
  '2022',
  jsonb_build_object(
    'projectName', 'Diageo Kick-off Meeting',
    'shortDescription', '',
    'highlights', ''
  ),
  ARRAY['https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop'],
  'landscape',
  0
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Diageo Kick-off Meeting');

INSERT INTO projects (category_id, title, location, year, external_content, images, layout, order_index)
SELECT 
  (SELECT id FROM project_categories WHERE slug = 'events' LIMIT 1),
  'Microsoft Future Now',
  'Lotte Hotel Hanoi',
  '2019',
  jsonb_build_object(
    'projectName', 'Microsoft Future Now',
    'shortDescription', '',
    'highlights', ''
  ),
  ARRAY['https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop'],
  'landscape',
  1
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Microsoft Future Now');

INSERT INTO projects (category_id, title, location, year, external_content, images, layout, order_index)
SELECT 
  (SELECT id FROM project_categories WHERE slug = 'events' LIMIT 1),
  'Land Rover Launch',
  'JW Marriott',
  '2021',
  jsonb_build_object(
    'projectName', 'Land Rover Launch',
    'shortDescription', '',
    'highlights', ''
  ),
  ARRAY['https://images.unsplash.com/photo-1505373877841-8d43f716ca77?q=80&w=2069&auto=format&fit=crop'],
  'landscape',
  2
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Land Rover Launch');

-- 3. DESIGN HUB PROJECTS (2 projects)
INSERT INTO projects (category_id, title, location, external_content, images, layout, order_index)
SELECT 
  (SELECT id FROM project_categories WHERE slug = 'design-hub' LIMIT 1),
  'Jaguar Land Rover Studio',
  'Trang Tien Plaza',
  jsonb_build_object(
    'projectName', 'Jaguar Land Rover Studio',
    'shortDescription', 'Luxury retail space concept',
    'highlights', ''
  ),
  ARRAY['https://images.unsplash.com/photo-1562141989-c5c79ac8f576?q=80&w=2070&auto=format&fit=crop'],
  'landscape',
  0
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Jaguar Land Rover Studio');

INSERT INTO projects (category_id, title, location, external_content, images, layout, order_index)
SELECT 
  (SELECT id FROM project_categories WHERE slug = 'design-hub' LIMIT 1),
  'Beta Cineplex Concept',
  'Nationwide',
  jsonb_build_object(
    'projectName', 'Beta Cineplex Concept',
    'shortDescription', 'Youthful & vibrant cinema design',
    'highlights', ''
  ),
  ARRAY['https://images.unsplash.com/photo-1517604931442-71053e3e2c28?q=80&w=2069&auto=format&fit=crop'],
  'landscape',
  1
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Beta Cineplex Concept');

-- 4. PROJECT INSIGHTS (2 projects)
INSERT INTO projects (category_id, title, year, external_content, images, layout, order_index)
SELECT 
  (SELECT id FROM project_categories WHERE slug = 'project-insights' LIMIT 1),
  'Solving the Curved Wall Challenge',
  'Oct 2024',
  jsonb_build_object(
    'projectName', 'Solving the Curved Wall Challenge',
    'shortDescription', 'How we used 3D Scanning to solve a complex production issue for a luxury showroom, ensuring perfect precision.',
    'highlights', '',
    'tag', 'Construction Technique'
  ),
  ARRAY['https://images.unsplash.com/photo-1581094794329-cdac82aadbcc?q=80&w=2000&auto=format&fit=crop'],
  'landscape',
  0
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Solving the Curved Wall Challenge');

INSERT INTO projects (category_id, title, year, external_content, images, layout, order_index)
SELECT 
  (SELECT id FROM project_categories WHERE slug = 'project-insights' LIMIT 1),
  'Sustainable Materials in Booth Design',
  'Sep 2024',
  jsonb_build_object(
    'projectName', 'Sustainable Materials in Booth Design',
    'shortDescription', 'Exploring eco-friendly materials for trade shows that reduce waste without compromising aesthetics.',
    'highlights', '',
    'tag', 'Design Trend'
  ),
  ARRAY['https://images.unsplash.com/photo-1518544806352-a2221eb43d45?q=80&w=2000&auto=format&fit=crop'],
  'landscape',
  1
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Sustainable Materials in Booth Design');
