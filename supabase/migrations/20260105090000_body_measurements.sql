create table body_measurements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  part_name text not null,
  value numeric not null,
  unit text default 'cm',
  created_at timestamptz default now()
);

-- Enable RLS
alter table body_measurements enable row level security;

-- Create policy to allow users to see their own measurements
create policy "Users can see their own measurements"
on body_measurements for select
using (auth.uid() = user_id);

-- Create policy to allow users to insert their own measurements
create policy "Users can insert their own measurements"
on body_measurements for insert
with check (auth.uid() = user_id);
