BEGIN;

-- Remove vocabulary items that don't have images (leaving 51 active items across tableware, cutlery, and glassware)
DELETE FROM vocabulary_items
WHERE image_url IS NULL OR trim(image_url) = '';

COMMIT;
