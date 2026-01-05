import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface Measurement {
    id: string;
    part_name: string;
    value: number;
    unit: string;
    created_at: string;
}

// Grouped by Date (Key: YYYY-MM-DD), Value: List of measurements for that day
interface MeasurementsByDate {
    [date: string]: Measurement[];
}

interface MeasurementHistoryProps {
    refreshTrigger: number;
}

export function MeasurementHistory({ refreshTrigger }: MeasurementHistoryProps) {
    const [dataByDate, setDataByDate] = useState<MeasurementsByDate>({});
    // We keep a secondary map to quickly look up the "previous" value for a specific body part
    // to calculate growth. This could be optimized but simplified for now.
    const [allMeasurements, setAllMeasurements] = useState<Measurement[]>([]);
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

            const raw = data || [];
            setAllMeasurements(raw);

            // Group by Date string (local date part)
            const grouped: MeasurementsByDate = {};
            raw.forEach((m: Measurement) => {
                const dateKey = format(new Date(m.created_at), "yyyy-MM-dd");
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(m);
            });

            setDataByDate(grouped);
        } catch (err) {
            console.error("Error fetching measurements:", err);
        } finally {
            setLoading(false);
        }
    };

    // Find the most recent measurement for this part *before* the current measurement's date
    const findPreviousValue = (currentMsg: Measurement, fullList: Measurement[]) => {
        // Current timestamp
        const currentTs = new Date(currentMsg.created_at).getTime();

        // Filter for same part, strictly older
        const candidates = fullList.filter(m =>
            m.part_name === currentMsg.part_name &&
            new Date(m.created_at).getTime() < currentTs
        );

        // Sort descending by date
        candidates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return candidates.length > 0 ? candidates[0].value : null;
    };

    const calculateChange = (current: number, previous: number | null) => {
        if (previous === null) return null;
        const diff = current - previous;
        const percent = ((diff / previous) * 100).toFixed(1);
        return { diff: diff.toFixed(1), percent };
    };

    const getChangeIcon = (percent: number) => {
        if (percent > 0) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
        if (percent < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
        return <Minus className="w-3 h-3 text-neutral-500" />;
    };

    if (loading) {
        return <div className="text-center text-neutral-500 py-8">Loading history...</div>;
    }

    const sortedDates = Object.keys(dataByDate).sort((a, b) => b.localeCompare(a)); // Descending dates

    if (sortedDates.length === 0) {
        return (
            <div className="text-center text-neutral-500 py-8 bg-neutral-900/50 rounded-xl border border-neutral-800 border-dashed">
                No history yet. Start logging!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white px-1">History</h3>

            <Accordion type="single" collapsible className="space-y-2">
                {sortedDates.map((dateKey) => {
                    const updates = dataByDate[dateKey];
                    // Determine a nice title, e.g. "Jan 5, 2026"
                    const displayDate = format(new Date(dateKey), "MMMM d, yyyy");
                    // Summary text, e.g. "5 updates"
                    const summary = `${updates.length} metric${updates.length > 1 ? "s" : ""}`;

                    return (
                        <AccordionItem key={dateKey} value={dateKey} className="bg-neutral-900 border border-neutral-800 rounded-lg px-2">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-neutral-950 rounded border border-neutral-800 text-neutral-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-medium text-white">{displayDate}</div>
                                        <div className="text-xs text-neutral-500">{summary}</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3 pt-1 space-y-2">
                                {updates.map((measurement) => {
                                    const prevVal = findPreviousValue(measurement, allMeasurements);
                                    const change = calculateChange(measurement.value, prevVal);

                                    return (
                                        <div key={measurement.id} className="flex justify-between items-center p-2 bg-neutral-950/50 rounded border border-neutral-800/50">
                                            <span className="text-sm text-neutral-300 font-medium">{measurement.part_name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-white font-bold">
                                                    {measurement.value} <span className="text-[10px] text-neutral-500 font-normal">{measurement.unit}</span>
                                                </span>
                                                {change && (
                                                    <div className={`flex items-center gap-1 text-xs ${parseFloat(change.percent) > 0 ? "text-emerald-500" : parseFloat(change.percent) < 0 ? "text-red-500" : "text-neutral-500"
                                                        }`}>
                                                        {getChangeIcon(parseFloat(change.percent))}
                                                        <span>{change.percent}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}
