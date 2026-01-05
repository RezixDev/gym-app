-- Create daily_nutrition table
create table public.daily_nutrition (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  date date not null default current_date,
  calories integer not null default 0,
  protein integer not null default 0,
  carbs integer not null default 0,
  fats integer not null default 0,
  created_at timestamp with time zone default now(),
  primary key (id),
  unique (user_id, date)
);

-- Enable RLS for daily_nutrition
alter table public.daily_nutrition enable row level security;

-- Policies for daily_nutrition
create policy "Users can view their own nutrition logs."
  on public.daily_nutrition for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own nutrition logs."
  on public.daily_nutrition for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own nutrition logs."
  on public.daily_nutrition for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own nutrition logs."
  on public.daily_nutrition for delete
  using ( auth.uid() = user_id );

-- Add nutrition goals to profiles
alter table public.profiles 
add column if not exists calorie_goal integer default 2000,
add column if not exists protein_goal integer default 150;
