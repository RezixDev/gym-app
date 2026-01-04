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
}

export function ProgressAnalytics() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [rawData, setRawData] = useState<WorkoutSet[]>([]);
    const [metric, setMetric] = useState<"1rm" | "volume">("1rm");

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

            return {
                date: format(dateObj, "MMM d"), // Display format
                dateObj, // For sorting if needed
                max1RM: Math.round(max1RM),
                totalVolume: Math.round(totalVolume)
            };
        });

        // Sort by date just in case
        return dataPoints.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    }, [rawData]);

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" /></div>;
    }

    return (
        <div className="pb-24 pt- safe-top min-h-screen bg-neutral-950 text-neutral-100 p-4">
            <h1 className="text-2xl font-bold text-emerald-500 mb-6 font-display">Step Progress</h1>

            <div className="space-y-6">
                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Exercise</label>
                        <select
                            value={selectedExerciseId}
                            onChange={(e) => setSelectedExerciseId(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                        >
                            {exercises.map((ex) => (
                                <option key={ex.id} value={ex.id}>{ex.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Metric</label>
                        <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                            <button
                                onClick={() => setMetric("1rm")}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${metric === "1rm" ? "bg-emerald-500/20 text-emerald-500" : "text-neutral-400 hover:text-neutral-300"}`}
                            >
                                Est. 1RM
                            </button>
                            <button
                                onClick={() => setMetric("volume")}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${metric === "volume" ? "bg-emerald-500/20 text-emerald-500" : "text-neutral-400 hover:text-neutral-300"}`}
                            >
                                Volume
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 h-[400px]">
                    {loadingData ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="animate-spin text-neutral-600" />
                        </div>
                    ) : chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#525252"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#525252"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#171717',
                                        border: '1px solid #262626',
                                        borderRadius: '8px',
                                        color: '#E5E5E5'
                                    }}
                                    itemStyle={{ color: '#E5E5E5' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey={metric === "1rm" ? "max1RM" : "totalVolume"}
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
