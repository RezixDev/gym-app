import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Ruler, Check, AlertCircle } from "lucide-react";

const BODY_PARTS = [
    "Biceps (Right)",
    "Biceps (Left)",
    "Chest",
    "Waist",
    "Hips",
    "Thigh (Right)",
    "Thigh (Left)",
    "Calf (Right)",
    "Calf (Left)",
    "Shoulders",
    "Forearm (Right)",
    "Forearm (Left)",
    "Neck",
    "Weight",
];

interface MeasurementEntryFormProps {
    onEntryAdded: () => void;
}

export function MeasurementEntryForm({ onEntryAdded }: MeasurementEntryFormProps) {
    const [partName, setPartName] = useState("");
    const [value, setValue] = useState("");
    const [unit, setUnit] = useState("cm");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!partName || !value) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("No user logged in");

            const { error: insertError } = await supabase
                .from("body_measurements")
                .insert({
                    user_id: user.id,
                    part_name: partName,
                    value: parseFloat(value),
                    unit: unit,
                });

            if (insertError) throw insertError;

            setSuccess(true);
            setValue("");
            // Reset success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
            onEntryAdded();
        } catch (err: any) {
            console.error("Error logging measurement:", err);
            setError(err.message || "Failed to save measurement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full bg-neutral-900 border-neutral-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-emerald-500" />
                    Log Measurement
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="body-part" className="text-neutral-400">Body Part</Label>
                        <Select value={partName} onValueChange={setPartName}>
                            <SelectTrigger id="body-part" className="bg-neutral-950 border-neutral-800 text-white">
                                <SelectValue placeholder="Select body part" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-neutral-800">
                                {BODY_PARTS.map((part) => (
                                    <SelectItem key={part} value={part} className="text-neutral-300 focus:bg-neutral-800 focus:text-white">
                                        {part}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="value" className="text-neutral-400">Value</Label>
                            <Input
                                id="value"
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="bg-neutral-950 border-neutral-800 text-white"
                                inputMode="decimal"
                            />
                        </div>
                        <div className="w-24 space-y-2">
                            <Label htmlFor="unit" className="text-neutral-400">Unit</Label>
                            <Select value={unit} onValueChange={setUnit}>
                                <SelectTrigger id="unit" className="bg-neutral-950 border-neutral-800 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-neutral-800">
                                    <SelectItem value="cm" className="text-neutral-300 focus:bg-neutral-800 focus:text-white">cm</SelectItem>
                                    <SelectItem value="in" className="text-neutral-300 focus:bg-neutral-800 focus:text-white">in</SelectItem>
                                    <SelectItem value="kg" className="text-neutral-300 focus:bg-neutral-800 focus:text-white">kg</SelectItem>
                                    <SelectItem value="lbs" className="text-neutral-300 focus:bg-neutral-800 focus:text-white">lbs</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 p-2 rounded">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : success ? (
                            <span className="flex items-center gap-2">
                                <Check className="w-4 h-4" /> Saved
                            </span>
                        ) : "Log Entry"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
