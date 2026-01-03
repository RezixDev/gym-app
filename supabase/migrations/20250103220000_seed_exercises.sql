-- Seed exercises table with common gym exercises

-- Chest exercises
INSERT INTO public.exercises (name, muscle_group, equipment_type) VALUES
  ('Bench Press', 'Chest', 'Barbell'),
  ('Incline Bench Press', 'Chest', 'Barbell'),
  ('Decline Bench Press', 'Chest', 'Barbell'),
  ('Dumbbell Fly', 'Chest', 'Dumbbell'),
  ('Cable Crossover', 'Chest', 'Cable'),
  ('Push-Up', 'Chest', 'Bodyweight'),
  ('Chest Dip', 'Chest', 'Bodyweight'),
  ('Pec Deck Machine', 'Chest', 'Machine');

-- Back exercises
INSERT INTO public.exercises (name, muscle_group, equipment_type) VALUES
  ('Deadlift', 'Back', 'Barbell'),
  ('Pull-Up', 'Back', 'Bodyweight'),
  ('Lat Pulldown', 'Back', 'Cable'),
  ('Barbell Row', 'Back', 'Barbell'),
  ('Dumbbell Row', 'Back', 'Dumbbell'),
  ('Seated Cable Row', 'Back', 'Cable'),
  ('T-Bar Row', 'Back', 'Barbell'),
  ('Face Pull', 'Back', 'Cable');

-- Shoulder exercises
INSERT INTO public.exercises (name, muscle_group, equipment_type) VALUES
  ('Overhead Press', 'Shoulders', 'Barbell'),
  ('Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell'),
  ('Lateral Raise', 'Shoulders', 'Dumbbell'),
  ('Front Raise', 'Shoulders', 'Dumbbell'),
  ('Rear Delt Fly', 'Shoulders', 'Dumbbell'),
  ('Arnold Press', 'Shoulders', 'Dumbbell'),
  ('Upright Row', 'Shoulders', 'Barbell');

-- Leg exercises
INSERT INTO public.exercises (name, muscle_group, equipment_type) VALUES
  ('Squat', 'Legs', 'Barbell'),
  ('Leg Press', 'Legs', 'Machine'),
  ('Romanian Deadlift', 'Legs', 'Barbell'),
  ('Leg Curl', 'Legs', 'Machine'),
  ('Leg Extension', 'Legs', 'Machine'),
  ('Calf Raise', 'Calves', 'Machine'),
  ('Lunges', 'Legs', 'Dumbbell'),
  ('Bulgarian Split Squat', 'Legs', 'Dumbbell'),
  ('Hip Thrust', 'Glutes', 'Barbell'),
  ('Goblet Squat', 'Legs', 'Dumbbell');

-- Arm exercises
INSERT INTO public.exercises (name, muscle_group, equipment_type) VALUES
  ('Barbell Curl', 'Biceps', 'Barbell'),
  ('Dumbbell Curl', 'Biceps', 'Dumbbell'),
  ('Hammer Curl', 'Biceps', 'Dumbbell'),
  ('Preacher Curl', 'Biceps', 'Barbell'),
  ('Tricep Pushdown', 'Triceps', 'Cable'),
  ('Skull Crusher', 'Triceps', 'Barbell'),
  ('Tricep Dip', 'Triceps', 'Bodyweight'),
  ('Overhead Tricep Extension', 'Triceps', 'Dumbbell'),
  ('Close-Grip Bench Press', 'Triceps', 'Barbell');

-- Core exercises
INSERT INTO public.exercises (name, muscle_group, equipment_type) VALUES
  ('Plank', 'Core', 'Bodyweight'),
  ('Hanging Leg Raise', 'Core', 'Bodyweight'),
  ('Cable Crunch', 'Core', 'Cable'),
  ('Russian Twist', 'Core', 'Bodyweight'),
  ('Ab Rollout', 'Core', 'Ab Wheel'),
  ('Dead Bug', 'Core', 'Bodyweight');

-- Cardio exercises
INSERT INTO public.exercises (name, muscle_group, equipment_type) VALUES
  ('Treadmill Running', 'Cardio', 'Cardio Machine'),
  ('Stationary Bike', 'Cardio', 'Cardio Machine'),
  ('Rowing Machine', 'Cardio', 'Cardio Machine'),
  ('Stair Climber', 'Cardio', 'Cardio Machine'),
  ('Jump Rope', 'Cardio', 'Bodyweight');

-- Flexibility exercises
INSERT INTO public.exercises (name, muscle_group, equipment_type) VALUES
  ('Foam Rolling', 'Full Body', 'Foam Roller'),
  ('Resistance Band Stretch', 'Full Body', 'Resistance Band'),
  ('Yoga Flow', 'Full Body', 'Yoga Mat');
