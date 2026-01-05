import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Measurement {
    id: string;
    part_name: string;
    value: number;
    unit: string;
    created_at: string;
}

interface GroupedMeasurements {
    [key: string]: Measurement[];
}

interface MeasurementHistoryProps {
    refreshTrigger: number;
}

export function MeasurementHistory({ refreshTrigger }: MeasurementHistoryProps) {
    const [measurements, setMeasurements] = useState<GroupedMeasurements>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeasurements();
    }, [refreshTrigger]);

    const fetchMeasurements = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("body_measurements")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Group by body part
            const grouped = (data || []).reduce((acc: GroupedMeasurements, curr: Measurement) => {
                if (!acc[curr.part_name]) {
                    acc[curr.part_name] = [];
                }
                acc[curr.part_name].push(curr);
                return acc;
            }, {});

            setMeasurements(grouped);
        } catch (err) {
            console.error("Error fetching measurements:", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateChange = (current: number, previous: number) => {
        if (!previous) return null;
        const diff = current - previous;
        const percent = ((diff / previous) * 100).toFixed(1);
        return { diff: diff.toFixed(1), percent };
    };

    const getChangeIcon = (percent: number) => {
        if (percent > 0) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
        if (percent < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-neutral-500" />;
    };

    if (loading) {
        return <div className="text-center text-neutral-500 py-8">Loading history...</div>;
    }

    const sortedParts = Object.keys(measurements).sort();

    if (sortedParts.length === 0) {
        return (
            <div className="text-center text-neutral-500 py-8 bg-neutral-900/50 rounded-xl border border-neutral-800 border-dashed">
                No measurements recorded yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white px-1">History</h3>
            {sortedParts.map((part) => {
                const history = measurements[part];
                const latest = history[0];
                const previous = history[1];
                const change = previous ? calculateChange(latest.value, previous.value) : null;

                return (
                    <Card key={part} className="bg-neutral-900 border-neutral-800">
                        <CardHeader className="py-3">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base font-medium text-emerald-400">
                                    {part}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-white">
                                        {latest.value}
                                        <span className="text-sm font-normal text-neutral-500 ml-1">{latest.unit}</span>
                                    </span>
                                    {change && (
                                        <div className={`flex items-center text-xs px-2 py-1 rounded-full bg-neutral-950 border border-neutral-800 ${parseFloat(change.percent) > 0 ? "text-emerald-500" : parseFloat(change.percent) < 0 ? "text-red-500" : "text-neutral-500"
                                            }`}>
                                            {getChangeIcon(parseFloat(change.percent))}
                                            <span className="ml-1">{change.percent}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="py-3 pt-0">
                            <div className="space-y-2">
                                {history.slice(1, 4).map((entry, idx) => (
                                    <div key={entry.id} className="flex justify-between items-center text-sm text-neutral-400 border-t border-neutral-800 pt-2">
                                        <span>{format(new Date(entry.created_at), "MMM d, yyyy")}</span>
                                        <span>{entry.value} {entry.unit}</span>
                                    </div>
                                ))}
                                {history.length > 4 && (
                                    <div className="text-xs text-neutral-600 text-center pt-1">
                                        + {history.length - 4} more entries
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
