import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ruler, Check, AlertCircle, Calendar } from "lucide-react";
import { format } from "date-fns";

const BODY_PARTS = [
    "Weight",
    "Neck",
    "Shoulders",
    "Chest",
    "Biceps (Left)",
    "Biceps (Right)",
    "Forearm (Left)",
    "Forearm (Right)",
    "Waist",
    "Hips",
    "Thigh (Left)",
    "Thigh (Right)",
    "Calf (Left)",
    "Calf (Right)",
];

interface MeasurementEntryFormProps {
    onEntryAdded: () => void;
}

export function MeasurementEntryForm({ onEntryAdded }: MeasurementEntryFormProps) {
    const { t } = useTranslation();
    // Key is body part name, value is the input string
    const [values, setValues] = useState<Record<string, string>>({});
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleValueChange = (part: string, val: string) => {
        setValues(prev => ({ ...prev, [part]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Filter out empty values
        const entriesToSave = Object.entries(values).filter(([_, val]) => val && val.trim() !== "");

        if (entriesToSave.length === 0) {
            if (entriesToSave.length === 0) {
                setError(t('measurements.enterOne'));
                return;
            }
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error(t('measurements.noUser'));

            // Prepare batch insert
            const rows = entriesToSave.map(([part, val]) => ({
                user_id: user.id,
                part_name: part,
                value: parseFloat(val),
                // Simple logic for unit: kg/lbs for Weight, cm/in for others. 
                // For now hardcoding 'kg' first if Weight, else 'cm'. 
                // Real implementation might need per-field unit toggle or global preference.
                unit: part === "Weight" ? "kg" : "cm",
                created_at: new Date(date).toISOString(),
            }));

            const { error: insertError } = await supabase
                .from("body_measurements")
                .insert(rows);

            if (insertError) throw insertError;

            setSuccess(true);
            setValues({}); // Clear form
            setTimeout(() => setSuccess(false), 3000);
            onEntryAdded();
        } catch (err: any) {
            console.error("Error logging measurement:", err);
            setError(err.message || t('measurements.saveError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full bg-neutral-900 border-neutral-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-emerald-500" />
                    Log Day
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-neutral-400 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-neutral-950 border-neutral-800 text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {BODY_PARTS.map((part) => (
                            <div key={part} className="space-y-1">
                                <Label htmlFor={`input-${part}`} className="text-xs text-neutral-500 truncate block" title={part}>
                                    {part}
                                </Label>
                                <Input
                                    id={`input-${part}`}
                                    type="number"
                                    step="0.1"
                                    placeholder="-"
                                    value={values[part] || ""}
                                    onChange={(e) => handleValueChange(part, e.target.value)}
                                    className="bg-neutral-950 border-neutral-800 text-white h-9 px-2 text-sm"
                                    inputMode="decimal"
                                />
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 p-2 rounded">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all sticky bottom-4 shadow-lg shadow-neutral-950/50"
                        disabled={loading}
                    >
                        {loading ? t('measurements.saving') : success ? (
                            <span className="flex items-center gap-2">
                                <Check className="w-4 h-4" /> {t('measurements.saved')}
                            </span>
                        ) : t('measurements.saveEntry')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
