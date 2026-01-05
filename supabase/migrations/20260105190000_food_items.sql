-- Create food_items table
create table public.food_items (
  id uuid not null default gen_random_uuid(),
  name text not null,
  calories integer not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fats numeric not null default 0,
  unit text not null default 'serving',
  quality_score integer not null default 50, -- 1 to 100
  image_url text,
  created_at timestamp with time zone default now(),
  primary key (id)
);

-- Enable RLS for food_items
alter table public.food_items enable row level security;
create policy "Food items are viewable by everyone." on public.food_items for select using ( true );
-- Only admins/service role can insert (for now, or maybe users can add custom foods later)
-- Keeping it simple: users can view all.

-- Create meal_logs table
-- Represents a "Meal Event" (e.g. "Breakfast on 2026-01-05")
create table public.meal_logs (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  date date not null default current_date,
  meal_type text not null, -- 'Breakfast', 'Lunch', 'Dinner', 'Snack'
  created_at timestamp with time zone default now(),
  primary key (id)
);

-- Enable RLS for meal_logs
alter table public.meal_logs enable row level security;
create policy "Users can view their own meal logs." on public.meal_logs for select using ( auth.uid() = user_id );
create policy "Users can insert their own meal logs." on public.meal_logs for insert with check ( auth.uid() = user_id );
create policy "Users can update their own meal logs." on public.meal_logs for update using ( auth.uid() = user_id );
create policy "Users can delete their own meal logs." on public.meal_logs for delete using ( auth.uid() = user_id );

-- Create meal_items table
-- Links a food item to a meal log with a quantity
create table public.meal_items (
  id uuid not null default gen_random_uuid(),
  meal_log_id uuid not null references public.meal_logs on delete cascade,
  food_item_id uuid not null references public.food_items on delete cascade,
  quantity numeric not null default 1,
  created_at timestamp with time zone default now(),
  primary key (id)
);

-- Enable RLS for meal_items
alter table public.meal_items enable row level security;
-- Access controlled via meal_log ownership
create policy "Users can view items of their meal logs."
  on public.meal_items for select
  using (
    exists (
      select 1 from public.meal_logs
      where meal_logs.id = meal_items.meal_log_id
      and meal_logs.user_id = auth.uid()
    )
  );

create policy "Users can insert items to their meal logs."
  on public.meal_items for insert
  with check (
    exists (
      select 1 from public.meal_logs
      where meal_logs.id = meal_items.meal_log_id
      and meal_logs.user_id = auth.uid()
    )
  );

create policy "Users can update items in their meal logs."
  on public.meal_items for update
  using (
    exists (
      select 1 from public.meal_logs
      where meal_logs.id = meal_items.meal_log_id
      and meal_logs.user_id = auth.uid()
    )
  );

create policy "Users can delete items from their meal logs."
  on public.meal_items for delete
  using (
    exists (
      select 1 from public.meal_logs
      where meal_logs.id = meal_items.meal_log_id
      and meal_logs.user_id = auth.uid()
    )
  );


-- Seed Data
insert into public.food_items (name, calories, protein, carbs, fats, unit, quality_score) values
('Egg (Large)', 70, 6, 0.5, 5, 'piece', 95),
('Brown Bread', 80, 4, 15, 1, 'slice', 75),
('Tomato', 22, 1, 5, 0.2, 'whole', 90),
('Cucumber', 16, 0.7, 4, 0.1, 'whole', 85),
('Butter', 102, 0.1, 0, 11.5, 'tbsp', 40),
('Chicken Breast (100g)', 165, 31, 0, 3.6, '100g', 98),
('Rice (White, 100g cooked)', 130, 2.7, 28, 0.3, '100g', 60),
('Broccoli (100g)', 55, 3.7, 11, 0.6, '100g', 95),
('Oats (Dry, 50g)', 190, 6, 33, 3, '50g', 92),
('Milk (Whole, 250ml)', 150, 8, 12, 8, 'cup', 80),
('Banana', 105, 1.3, 27, 0.3, 'piece', 85),
('Whey Protein Scoop', 120, 24, 3, 1, 'scoop', 90);
