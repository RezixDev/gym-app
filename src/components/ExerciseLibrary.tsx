import { useState, useEffect, useMemo } from "react";
import { Search, Dumbbell } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Exercise {
    id: string;
    name: string;
    muscle_group: string | null;
    equipment_type: string | null;
}

// Map equipment types to category badges
function getCategoryVariant(equipmentType: string | null): "strength" | "cardio" | "flexibility" {
    if (!equipmentType) return "strength";
    const type = equipmentType.toLowerCase();
    if (type.includes("cardio") || type.includes("treadmill") || type.includes("bike")) {
        return "cardio";
    }
    if (type.includes("yoga") || type.includes("stretch") || type.includes("band")) {
        return "flexibility";
    }
    return "strength";
}

function getCategoryLabel(equipmentType: string | null): string {
    const variant = getCategoryVariant(equipmentType);
    switch (variant) {
        case "cardio":
            return "Cardio";
        case "flexibility":
            return "Flexibility";
        default:
            return "Strength";
    }
}

interface ExerciseLibraryProps {
    onSelect?: (exercise: Exercise) => void;
}

export function ExerciseLibrary({ onSelect }: ExerciseLibraryProps) {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch exercises on mount
    useEffect(() => {
        async function fetchExercises() {
            try {
                setLoading(true);
                setError(null);

                const { data, error: supabaseError } = await supabase
                    .from("exercises")
                    .select("*")
                    .order("name");

                if (supabaseError) {
                    throw supabaseError;
                }

                setExercises(data || []);
            } catch (err) {
                console.error("Error fetching exercises:", err);
                setError("Failed to load exercises. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        fetchExercises();
    }, []);

    // Filter exercises based on search query
    const filteredExercises = useMemo(() => {
        if (!searchQuery.trim()) {
            return exercises;
        }

        const query = searchQuery.toLowerCase().trim();
        return exercises.filter((exercise) => {
            const nameMatch = exercise.name.toLowerCase().includes(query);
            const muscleMatch = exercise.muscle_group?.toLowerCase().includes(query);
            const equipmentMatch = exercise.equipment_type?.toLowerCase().includes(query);
            return nameMatch || muscleMatch || equipmentMatch;
        });
    }, [exercises, searchQuery]);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="p-4 space-y-4">
                <h1 className="text-3xl font-bold text-white">Exercise Library</h1>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                        type="text"
                        placeholder="Search exercises..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
                    />
                </div>
            </div>

            {/* Exercise List */}
            <ScrollArea className="flex-1 px-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-pulse text-neutral-400">Loading exercises...</div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-red-400 mb-2">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-emerald-500 hover:text-emerald-400 underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredExercises.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Dumbbell className="h-12 w-12 text-neutral-600 mb-4" />
                        <p className="text-neutral-400">
                            {searchQuery
                                ? "No exercises found matching your search."
                                : "No exercises available yet."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 pb-4">
                        {filteredExercises.map((exercise) => (
                            <Card
                                key={exercise.id}
                                onClick={() => onSelect?.(exercise)}
                                className={`bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer ${onSelect ? 'hover:bg-neutral-800' : ''}`}
                            >
                                <CardContent className="flex items-center justify-between py-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-neutral-100 truncate">
                                            {exercise.name}
                                        </h3>
                                        <p className="text-sm text-neutral-400 mt-0.5">
                                            {exercise.muscle_group || "General"}
                                        </p>
                                    </div>
                                    <Badge variant={getCategoryVariant(exercise.equipment_type)}>
                                        {getCategoryLabel(exercise.equipment_type)}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Results count */}
            {!loading && !error && exercises.length > 0 && (
                <div className="px-4 py-2 text-center text-xs text-neutral-500 border-t border-neutral-800">
                    Showing {filteredExercises.length} of {exercises.length} exercises
                </div>
            )}
        </div>
    );
}
