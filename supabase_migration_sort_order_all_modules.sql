ALTER TABLE apartments
ADD COLUMN IF NOT EXISTS sort_order INTEGER;

ALTER TABLE investments
ADD COLUMN IF NOT EXISTS sort_order INTEGER;

ALTER TABLE news
ADD COLUMN IF NOT EXISTS sort_order INTEGER;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) - 1 AS rn
  FROM apartments
)
UPDATE apartments AS a
SET sort_order = ranked.rn
FROM ranked
WHERE a.id = ranked.id
  AND a.sort_order IS NULL;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) - 1 AS rn
  FROM investments
)
UPDATE investments AS i
SET sort_order = ranked.rn
FROM ranked
WHERE i.id = ranked.id
  AND i.sort_order IS NULL;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) - 1 AS rn
  FROM news
)
UPDATE news AS n
SET sort_order = ranked.rn
FROM ranked
WHERE n.id = ranked.id
  AND n.sort_order IS NULL;

CREATE INDEX IF NOT EXISTS apartments_sort_order_idx ON apartments(sort_order);
CREATE INDEX IF NOT EXISTS investments_sort_order_idx ON investments(sort_order);
CREATE INDEX IF NOT EXISTS news_sort_order_idx ON news(sort_order);
