import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Dumbbell, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ExerciseLibrary } from "./ExerciseLibrary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface WorkoutSet {
    reps: number | "";
    weight: number | "";
}

interface WorkoutExercise {
    id: string; // unique id for the workout item, not exercise id
    exerciseId: string;
    name: string;
    sets: WorkoutSet[];
}

export function WorkoutLogger({ onFinish }: { onFinish?: () => void }) {
    const { t } = useTranslation();
    const { session } = useAuth();
    const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addExercise = (exercise: { id: string; name: string }) => {
        const newExercise: WorkoutExercise = {
            id: crypto.randomUUID(),
            exerciseId: exercise.id,
            name: exercise.name,
            sets: [{ reps: "", weight: "" }], // Start with one empty set
        };
        setExercises([...exercises, newExercise]);
        setIsLibraryOpen(false);
        toast.success(`${t('workouts.added')} ${exercise.name}`);
    };

    const removeExercise = (id: string) => {
        setExercises(exercises.filter(e => e.id !== id));
    };

    const addSet = (exerciseId: string) => {
        setExercises(exercises.map(e => {
            if (e.id === exerciseId) {
                // Pre-fill with previous set values if available, else empty
                const lastSet = e.sets[e.sets.length - 1];
                const newSet: WorkoutSet = lastSet ? { ...lastSet } : { reps: "", weight: "" };
                return { ...e, sets: [...e.sets, newSet] };
            }
            return e;
        }));
    };

    const removeSet = (exerciseId: string, setIndex: number) => {
        setExercises(exercises.map(e => {
            if (e.id === exerciseId) {
                const newSets = e.sets.filter((_, idx) => idx !== setIndex);
                // Ensure at least one set remains? Or allow empty? Let's allow empty for now or remove exercise if no sets?
                // Better UX: Allow removing all sets, but usually you want at least one. 
                // If removing the last set, maybe ask to remove exercise? 
                // For simplicity, just remove the set.
                return { ...e, sets: newSets };
            }
            return e;
        }));
    };

    const updateSet = (exerciseId: string, setIndex: number, field: keyof WorkoutSet, value: string) => {
        const numValue = value === "" ? "" : Number(value);
        if (typeof numValue === "number" && isNaN(numValue)) return; // Validate number

        setExercises(exercises.map(e => {
            if (e.id === exerciseId) {
                const newSets = [...e.sets];
                newSets[setIndex] = { ...newSets[setIndex], [field]: numValue };
                return { ...e, sets: newSets };
            }
            return e;
        }));
    };

    const handleFinish = async () => {
        if (exercises.length === 0) {
            toast.error(t('workouts.addExerciseRequired'));
            return;
        }

        if (!session?.user.id) {
            toast.error(t('workouts.loginRequired'));
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Create Workout
            const { data: workout, error: workoutError } = await supabase
                .from("workouts")
                .insert({
                    user_id: session.user.id,
                    start_time: new Date().toISOString(), // Assuming started now for simplicity, or could have start time state
                    end_time: new Date().toISOString(),
                    notes: "Logged via Active Workout",
                })
                .select()
                .single();

            if (workoutError) throw workoutError;

            // 2. Prepare Sets
            const setsToInsert: { workout_id: string; exercise_id: string; reps: number | string; weight: number | string; set_number: number }[] = [];

            for (const exercise of exercises) {
                exercise.sets.forEach((set, index) => {
                    if (set.reps !== "" && set.weight !== "") {
                        setsToInsert.push({
                            workout_id: workout.id,
                            exercise_id: exercise.exerciseId,
                            reps: set.reps,
                            weight: set.weight,
                            set_number: index + 1
                        });
                    }
                });
            }

            if (setsToInsert.length === 0) {
                // Warning: Workout with empty sets?
                toast.warning(t('workouts.noValidSets'));
            } else {
                const { error: setsError } = await supabase
                    .from("workout_sets")
                    .insert(setsToInsert);

                if (setsError) throw setsError;
            }

            toast.success(t('workouts.savedSuccess'));
            setExercises([]); // Clear state
            if (onFinish) onFinish();

        } catch (error) {
            console.error("Error saving workout:", error);
            toast.error(t('workouts.saveError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="p-4 space-y-4 border-b border-border">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">{t('workouts.activeWorkout')}</h1>
                    <Button
                        onClick={handleFinish}
                        disabled={isSubmitting || exercises.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {isSubmitting ? t('workouts.saving') : t('workouts.finish')}
                        <Save className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {exercises.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                        <Dumbbell className="w-12 h-12 mb-4 opacity-50" />
                        <p>{t('workouts.noExercises')}</p>
                        <p className="text-sm">{t('workouts.startAdding')}</p>
                    </div>
                ) : (
                    exercises.map((exercise) => (
                        <Card key={exercise.id} className="bg-card border-border">
                            <CardHeader className="flex flex-row items-center justify-between py-4">
                                <CardTitle className="text-lg font-semibold text-card-foreground">
                                    {exercise.name}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeExercise(exercise.id)}
                                    className="text-muted-foreground hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="grid grid-cols-10 gap-2 text-xs text-muted-foreground uppercase font-medium text-center">
                                        <div className="col-span-1">{t('workouts.set')}</div>
                                        <div className="col-span-4">{t('workouts.weight')}</div>
                                        <div className="col-span-4">{t('workouts.reps')}</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    {exercise.sets.map((set, idx) => (
                                        <div key={idx} className="grid grid-cols-10 gap-2 items-center">
                                            <div className="col-span-1 flex items-center justify-center">
                                                <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                            <div className="col-span-4">
                                                <Input
                                                    type="number"
                                                    inputMode="decimal"
                                                    placeholder="0"
                                                    value={set.weight}
                                                    onChange={(e) => updateSet(exercise.id, idx, "weight", e.target.value)}
                                                    className="bg-background border-border text-center h-9 focus-visible:ring-emerald-500/50"
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <Input
                                                    type="number"
                                                    inputMode="decimal"
                                                    placeholder="0"
                                                    value={set.reps}
                                                    onChange={(e) => updateSet(exercise.id, idx, "reps", e.target.value)}
                                                    className="bg-background border-border text-center h-9 focus-visible:ring-emerald-500/50"
                                                />
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                                    onClick={() => removeSet(exercise.id, idx)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addSet(exercise.id)}
                                    className="w-full border-border hover:bg-secondary text-muted-foreground hover:text-emerald-500 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('workouts.addSet')}
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}

                <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full h-12 text-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                            <Plus className="w-5 h-5 mr-2" />
                            {t('workouts.addExercise')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="h-[90vh] max-w-xl p-0 gap-0 bg-background border-border text-foreground flex flex-col">
                        <DialogTitle className="sr-only">{t('workouts.selectExercise')}</DialogTitle>
                        <DialogDescription className="sr-only">{t('workouts.chooseExercise')}</DialogDescription>
                        <ExerciseLibrary onSelect={addExercise} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
