-- Seed Healthy Staples
-- Macros are approximate averages per unit/100g

INSERT INTO public.food_items (name, calories, protein, carbs, fats, unit, quality_score) VALUES
-- Dairy
('Cottage Cheese (Hüttenkäse)', 98, 11, 3.4, 4.3, '100g', 95),
('Greek Yogurt (0% Fat)', 59, 10, 3.6, 0.4, '100g', 98),
('Skyr (Natural)', 63, 11, 4, 0.2, '100g', 98),
('Mozzarella (Light/Low Fat)', 240, 24, 2, 16, '125g ball', 85),
('Mozzarella (Ball)', 280, 18, 1, 22, '125g ball', 70),
('Parmesan', 430, 38, 4, 29, '100g', 80),

-- Fruits & Veg
('Blueberries', 57, 0.7, 14, 0.3, '100g', 100),
('Raspberries', 52, 1.2, 12, 0.7, '100g', 100),
('Strawberries', 32, 0.7, 7.7, 0.3, '100g', 95),
('Apple (Medium)', 95, 0.5, 25, 0.3, 'piece', 90),
('Banana (Medium)', 105, 1.3, 27, 0.3, 'piece', 85),
('Orange (Medium)', 62, 1.2, 15, 0.2, 'piece', 92),
('Avocado (Half)', 160, 2, 8.5, 15, 'half', 95),

-- Nuts & Healthy Fats
('Almonds', 579, 21, 22, 50, '100g', 95),
('Walnuts', 654, 15, 14, 65, '100g', 98),
('Peanut Butter (Natural)', 190, 8, 7, 16, '2 tbsp', 85),
('Chia Seeds', 486, 17, 42, 31, '100g', 100),
('Olive Oil', 120, 0, 0, 14, 'tbsp', 90),

-- Proteins
('Salmon (Filet)', 208, 20, 0, 13, '100g', 95),
('Tuna (Canned in Water)', 116, 26, 0, 1, 'can (drained)', 90),
('Turkey Breast', 135, 30, 0, 1, '100g', 98),
('Tofu (Firm)', 144, 15, 4, 8, '100g', 92),
('Chicken Breast (Cooked)', 165, 31, 0, 3.6, '100g', 98),
('Egg (Boiled)', 78, 6, 0.6, 5, 'piece', 95);
