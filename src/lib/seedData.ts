import { supabase } from "./supabase";
import { subDays, format } from "date-fns";

export async function seedWorkouts(userId: string) {
    console.log("Starting seed for user:", userId);

    // 1. Get some exercises
    const { data: exercises, error: exError } = await supabase
        .from("exercises")
        .select("id, name")
        .limit(5);

    if (exError || !exercises || exercises.length === 0) {
        console.error("Error fetching exercises or no exercises found", exError);
        throw new Error("No exercises found to seed with.");
    }

    console.log("Found exercises:", exercises.map(e => e.name));

    const exercisesToSeed = exercises.slice(0, 3); // Pick first 3
    const daysToSeed = 30;

    // 2. Loop through past 30 days
    for (let i = daysToSeed; i >= 0; i--) {
        // 50% chance to skip a day (rest day)
        if (Math.random() > 0.7) continue;

        const date = subDays(new Date(), i);
        // Add some random time to the date (e.g., between 8am and 8pm)
        date.setHours(8 + Math.floor(Math.random() * 12));

        console.log(`Seeding workout for ${format(date, 'yyyy-MM-dd')}`);

        // Create Workout
        const { data: workout, error: wError } = await supabase
            .from("workouts")
            .insert({
                user_id: userId,
                start_time: date.toISOString(),
                end_time: new Date(date.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
                notes: "Seeded workout",
            })
            .select()
            .single();

        if (wError || !workout) {
            console.error("Error creating workout", wError);
            continue;
        }

        // Create Sets for each exercise
        for (const exercise of exercisesToSeed) {
            // Linear progression: start weight + (day * increment) + random noise
            // Example: Bench Press starts at 60kg, gains 0.5kg/day roughly
            const baseWeight = 40 + (Math.random() * 20); // 40-60kg base
            const progress = (daysToSeed - i) * 1.5; // 1.5kg gain per day (unrealistic but good for chart)
            const weight = Math.round(baseWeight + progress);

            const numSets = 3 + Math.floor(Math.random() * 2); // 3-4 sets

            for (let s = 1; s <= numSets; s++) {
                const reps = 8 + Math.floor(Math.random() * 5); // 8-12 reps

                await supabase.from("workout_sets").insert({
                    workout_id: workout.id,
                    exercise_id: exercise.id,
                    reps,
                    weight,
                    set_number: s,
                });
            }
        }
    }

    console.log("Seeding complete!");
}
