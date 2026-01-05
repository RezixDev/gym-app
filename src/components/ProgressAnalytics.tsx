import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface Exercise {
    id: string;
    name: string;
}

interface WorkoutSet {
    id: string;
    reps: number;
    weight: number;
    workout: {
        start_time: string;
    };
}

interface ChartDataPoint {
    date: string;
    dateObj: Date;
    max1RM: number;
    totalVolume: number;
    avgWeight: number;
}

export function ProgressAnalytics() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [rawData, setRawData] = useState<WorkoutSet[]>([]);
    const [metric, setMetric] = useState<"1rm" | "volume" | "avgWeight">("1rm");

    // Fetch exercises on mount
    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const { data, error } = await supabase
                    .from("exercises")
                    .select("id, name")
                    .order("name");

                if (error) throw error;

                setExercises(data || []);
                if (data && data.length > 0) {
                    setSelectedExerciseId(data[0].id);
                }
            } catch (error) {
                console.error("Error fetching exercises:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, []);

    // Fetch workout data when exercise changes
    useEffect(() => {
        if (!selectedExerciseId) return;

        const fetchData = async () => {
            setLoadingData(true);
            try {
                // Fetch sets and join with workout to get date
                const { data, error } = await supabase
                    .from("workout_sets")
                    .select(`
                        id,
                        reps,
                        weight,
                        workout:workouts!inner(start_time)
                    `)
                    .eq("exercise_id", selectedExerciseId)
                    .order("workout(start_time)", { ascending: true }); // This ordering might need adjustment if Supabase doesn't support deep sorting easily, we can sort in JS

                if (error) {
                    // It's possible the join syntax or inner/left join behavior requires specific setup.
                    // This query assumes the relationship is clear.
                    // If 'workouts' is not the exact foreign key name, we might need to verify.
                    // Based on schema: workout_sets.workout_id references workouts.id
                    throw error;
                }

                // Supabase returns nested data. We cast it to our interface.
                // Note: supabase-js types might need 'workout' to be an array or object depending on relationship.
                // Since it's Many-to-One (Set belongs to Workout), it should be an object.
                setRawData((data as any) || []);

            } catch (error) {
                console.error("Error fetching analytics data:", error);
                setRawData([]);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [selectedExerciseId]);

    // Process data for chart
    const chartData = useMemo(() => {
        if (!rawData.length) return [];

        // Group sets by date
        const groupedByDate: Record<string, { sets: WorkoutSet[], dateObj: Date }> = {};

        rawData.forEach((set: any) => {
            const dateStr = set.workout?.start_time;
            if (!dateStr) return;

            const dateObj = new Date(dateStr);
            const dateKey = format(dateObj, "yyyy-MM-dd");

            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = { sets: [], dateObj };
            }
            groupedByDate[dateKey].sets.push(set);
        });

        // Calculate metrics per day
        const dataPoints: ChartDataPoint[] = Object.values(groupedByDate).map(({ sets, dateObj }) => {
            // Epley formula: 1RM = weight * (1 + reps/30)
            const max1RM = Math.max(...sets.map(s => s.weight * (1 + s.reps / 30)));

            // Volume = weight * reps
            const totalVolume = sets.reduce((sum, s) => sum + (s.weight * s.reps), 0);

            // Avg Weight
            const totalWeight = sets.reduce((sum, s) => sum + s.weight, 0);
            const avgWeight = totalWeight / sets.length;

            return {
                date: format(dateObj, "MMM d"), // Display format
                dateObj, // For sorting if needed
                max1RM: Math.round(max1RM),
                totalVolume: Math.round(totalVolume),
                avgWeight: Math.round(avgWeight * 10) / 10 // Round to 1 decimal
            };
        });

        // Sort by date just in case
        return dataPoints.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    }, [rawData]);

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" /></div>;
    }

    return (
        <div className="pb-24 pt- safe-top min-h-screen bg-background text-foreground p-4">
            <h1 className="text-2xl font-bold text-emerald-500 mb-6 font-display">Step Progress</h1>

            <div className="space-y-6">
                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Exercise</label>
                        <select
                            value={selectedExerciseId}
                            onChange={(e) => setSelectedExerciseId(e.target.value)}
                            className="w-full bg-card border border-border rounded-lg p-3 text-card-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                        >
                            {exercises.map((ex) => (
                                <option key={ex.id} value={ex.id}>{ex.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Metric</label>
                        <div className="flex bg-muted rounded-lg p-1 border border-border">
                            <button
                                onClick={() => setMetric("1rm")}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${metric === "1rm" ? "bg-background shadow-sm text-emerald-500" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Est. 1RM
                            </button>
                            <button
                                onClick={() => setMetric("volume")}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${metric === "volume" ? "bg-background shadow-sm text-emerald-500" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Volume
                            </button>
                            <button
                                onClick={() => setMetric("avgWeight")}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${metric === "avgWeight" ? "bg-background shadow-sm text-emerald-500" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Avg Weight
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-card border border-border rounded-xl p-4 h-[400px]">
                    {loadingData ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="animate-spin text-muted-foreground" />
                        </div>
                    ) : chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="hsl(var(--muted-foreground))"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                        color: 'hsl(var(--popover-foreground))'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey={metric === "1rm" ? "max1RM" : metric === "volume" ? "totalVolume" : "avgWeight"}
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-2">
                            <p>No data available for this exercise.</p>
                            <p className="text-xs">Log some workouts to see your progress!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
