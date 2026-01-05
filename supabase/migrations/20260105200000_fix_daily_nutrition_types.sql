-- Fix daily_nutrition types to allow decimals
ALTER TABLE public.daily_nutrition
ALTER COLUMN calories TYPE numeric,
ALTER COLUMN protein TYPE numeric,
ALTER COLUMN carbs TYPE numeric,
ALTER COLUMN fats TYPE numeric;
