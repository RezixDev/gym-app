-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  username text,
  updated_at timestamp with time zone default now(),
  primary key (id)
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Create exercises table
create table public.exercises (
  id uuid not null default gen_random_uuid(),
  name text not null,
  muscle_group text,
  equipment_type text,
  created_at timestamp with time zone default now(),
  primary key (id)
);

-- Enable RLS for exercises
alter table public.exercises enable row level security;

-- Policies for exercises
create policy "Authenticated users can view exercises."
  on public.exercises for select
  using ( auth.role() = 'authenticated' );

-- Create workouts table
create table public.workouts (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now(),
  primary key (id)
);

-- Enable RLS for workouts
alter table public.workouts enable row level security;

-- Policies for workouts
create policy "Users can view their own workouts."
  on public.workouts for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own workouts."
  on public.workouts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own workouts."
  on public.workouts for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own workouts."
  on public.workouts for delete
  using ( auth.uid() = user_id );

-- Create workout_sets table
create table public.workout_sets (
  id uuid not null default gen_random_uuid(),
  workout_id uuid not null references public.workouts on delete cascade,
  exercise_id uuid not null references public.exercises on delete cascade,
  reps integer not null,
  weight numeric not null,
  set_number integer not null,
  created_at timestamp with time zone default now(),
  primary key (id)
);

-- Enable RLS for workout_sets
alter table public.workout_sets enable row level security;

-- Policies for workout_sets
-- Access is controlled via the workout ownership
create policy "Users can view sets for their workouts."
  on public.workout_sets for select
  using (
    exists (
      select 1 from public.workouts
      where workouts.id = workout_sets.workout_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "Users can insert sets for their workouts."
  on public.workout_sets for insert
  with check (
    exists (
      select 1 from public.workouts
      where workouts.id = workout_sets.workout_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "Users can update sets for their workouts."
  on public.workout_sets for update
  using (
    exists (
      select 1 from public.workouts
      where workouts.id = workout_sets.workout_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "Users can delete sets for their workouts."
  on public.workout_sets for delete
  using (
    exists (
      select 1 from public.workouts
      where workouts.id = workout_sets.workout_id
      and workouts.user_id = auth.uid()
    )
  );
