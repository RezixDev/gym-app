import { useEffect, useState } from "react";
import { Plus, Calendar, Dumbbell } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface WorkoutSet {
    id: string;
    reps: number;
    weight: number;
    set_number: number;
    exercises: {
        name: string;
    };
}

interface Workout {
    id: string;
    start_time: string;
    end_time: string | null;
    workout_sets: WorkoutSet[];
}

export function WorkoutHistory({ onStartWorkout }: { onStartWorkout: () => void }) {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWorkouts() {
            try {
                // Fetch workouts with their sets and the exercise names for those sets
                const { data, error } = await supabase
                    .from("workouts")
                    .select(`
                        id,
                        start_time,
                        end_time,
                        workout_sets (
                            id,
                            reps,
                            weight,
                            set_number,
                            exercises (
                                name
                            )
                        )
                    `)
                    .order("start_time", { ascending: false });

                if (error) throw error;

                // Keep type safety by casting if necessary, but Supabase return type should loosely match structure if we checked schema.
                // Depending on Supabase generic type generation, this might need explicit casting or type assertion.
                // consistently mapped.
                setWorkouts(data as any as Workout[]);
            } catch (err) {
                console.error("Error fetching workouts:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchWorkouts();
    }, []);

    // Format date helper
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMM d, yyyy • h:mm a");
        } catch (e) {
            return "Invalid Date";
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="p-4 space-y-4 border-b border-neutral-800">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">History</h1>
                    <Button
                        onClick={onStartWorkout}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Log Workout
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-neutral-500">
                        Loading history...
                    </div>
                ) : workouts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-lg">
                        <Dumbbell className="w-12 h-12 mb-4 opacity-50" />
                        <p>No workouts logged yet.</p>
                        <Button
                            variant="link"
                            className="text-emerald-500 mt-2"
                            onClick={onStartWorkout}
                        >
                            Start your first workout
                        </Button>
                    </div>
                ) : (
                    <Accordion type="single" collapsible className="space-y-4">
                        {workouts.map((workout) => (
                            <AccordionItem
                                key={workout.id}
                                value={workout.id}
                                className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden data-[state=open]:border-neutral-700"
                            >
                                <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-neutral-800/50">
                                    <div className="flex items-center space-x-3 text-neutral-200">
                                        <Calendar className="w-4 h-4 text-neutral-500" />
                                        <span>{formatDate(workout.start_time)}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 bg-neutral-900/50">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-neutral-800 hover:bg-transparent">
                                                <TableHead className="text-neutral-500">Exercise</TableHead>
                                                <TableHead className="text-center text-neutral-500">Set</TableHead>
                                                <TableHead className="text-center text-neutral-500">kg</TableHead>
                                                <TableHead className="text-center text-neutral-500">Reps</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {workout.workout_sets
                                                .sort((a, b) => {
                                                    const nameA = a.exercises?.name || "";
                                                    const nameB = b.exercises?.name || "";
                                                    return nameA.localeCompare(nameB) || a.set_number - b.set_number;
                                                })
                                                .map((set) => (
                                                    <TableRow key={set.id} className="border-neutral-800 hover:bg-neutral-800/30">
                                                        <TableCell className="font-medium text-neutral-300">
                                                            {set.exercises?.name || "Unknown Exercise"}
                                                        </TableCell>
                                                        <TableCell className="text-center text-neutral-400">
                                                            {set.set_number}
                                                        </TableCell>
                                                        <TableCell className="text-center text-neutral-400">
                                                            {set.weight}
                                                        </TableCell>
                                                        <TableCell className="text-center text-neutral-400">
                                                            {set.reps}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </div>
    );
}
