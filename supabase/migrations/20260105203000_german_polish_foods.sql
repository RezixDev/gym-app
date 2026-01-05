-- Seed German and Polish food items
-- Macros are approximate averages

INSERT INTO public.food_items (name, calories, protein, carbs, fats, unit, quality_score) VALUES
-- German
('Bratwurst (Grilled)', 280, 12, 2, 25, 'piece', 40),
('Currywurst (w/ Sauce)', 450, 15, 12, 35, 'portion', 30),
('Wiener Schnitzel (Veal)', 350, 30, 20, 15, 'piece', 60),
('Schnitzel (Pork/Schweine)', 300, 25, 18, 14, 'piece', 55),
('Spätzle (Cooked)', 180, 7, 35, 2, '200g portion', 70),
('Sauerkraut', 25, 1, 4, 0, '100g', 95),
('Brezel (Pretzel)', 250, 7, 50, 3, 'piece', 50),
('Laugenbrötchen', 180, 5, 35, 2, 'piece', 55),
('Brötchen (White Roll)', 150, 4, 30, 1, 'piece', 50),
('Schwarzbrot (Whole Rye)', 190, 6, 35, 1, 'slice', 90),
('Magerquark (Low Fat Quark)', 70, 12, 4, 0.3, '100g', 100),
('Kartoffelsalat (Mayo)', 250, 3, 20, 18, '150g portion', 40),
('Kartoffelsalat (Vinegar/Oil)', 150, 3, 22, 6, '150g portion', 75),
('Döner Kebab (Chicken)', 550, 30, 45, 15, 'piece', 65),
('Döner Kebab (Beef/Lamb)', 650, 25, 45, 25, 'piece', 55),
('Leberkäse', 280, 13, 1, 25, 'slice (thick)', 35),
('Frikadelle (Meatball)', 220, 16, 5, 15, 'piece', 45),

-- Polish
('Pierogi Ruskie (Potato/Cheese)', 300, 10, 45, 8, '5 pieces', 65),
('Pierogi with Meat', 320, 15, 40, 10, '5 pieces', 70),
('Pierogi with Fruit', 250, 4, 50, 3, '5 pieces', 60),
('Kiełbasa (Sausage)', 250, 18, 1, 20, '100g', 45),
('Kabanos (Dry Sausage)', 350, 25, 1, 28, '100g', 40),
('Bigos (Hunters Stew)', 150, 10, 8, 10, '200g bowl', 80),
('Żurek (Sour Rye Soup)', 350, 12, 15, 18, 'bowl w/ egg/sausage', 70),
('Twaróg (Curd Cheese, Half-Fat)', 130, 18, 3, 4, '100g', 95),
('Placki Ziemniaczane (Potato Pancake)', 150, 3, 18, 8, 'piece', 50),
('Ogórki Kiszone (Pickle)', 12, 0, 2, 0, 'piece', 95),
('Kotlet Schabowy (Breaded Pork)', 320, 28, 20, 18, 'piece', 55),
('Gołąbki (Cabbage Roll)', 200, 12, 15, 8, 'piece', 80),
('Kasza Gryczana (Buckwheat)', 120, 4, 25, 1, '100g cooked', 95),
('Pączek (Doughnut)', 300, 4, 35, 15, 'piece', 10),

-- Common Staples
('Gouda Cheese (Slice)', 110, 7, 0, 9, 'slice', 60),
('Emmentaler (Slice)', 120, 9, 0, 9, 'slice', 60),
('Salami', 110, 6, 0.5, 9, 'slice', 30),
('Ham (Cooked)', 40, 6, 0.5, 1.5, 'slice', 80),
('Butter (Portion)', 75, 0, 0, 8, '10g (knife tip)', 40),
('Kefir', 50, 3.5, 4, 1.5, '100ml', 95),
('Rye Bread', 100, 3, 20, 1, 'slice', 85);
