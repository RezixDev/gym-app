import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Flame, Beef, ChefHat, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function NutritionLogger({ onLogComplete }: { onLogComplete?: () => void }) {
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fats, setFats] = useState("");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!calories && !protein) {
            toast.error("Please enter at least calories or protein");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // We need to fetch existing log for the date to add to it, or rely on UPSERT with some logic.
            // But simple upsert overwrites. We want to ADD. 
            // So we should fetch first.
            const { data: existing, error: fetchError } = await supabase
                .from("daily_nutrition")
                .select("*")
                .eq("user_id", user.id)
                .eq("date", date)
                .single();

            if (fetchError && fetchError.code !== "PGRST116") {
                throw fetchError;
            }

            const newCalories = (existing?.calories || 0) + (parseInt(calories) || 0);
            const newProtein = (existing?.protein || 0) + (parseInt(protein) || 0);
            const newCarbs = (existing?.carbs || 0) + (parseInt(carbs) || 0);
            const newFats = (existing?.fats || 0) + (parseInt(fats) || 0);

            const { error: upsertError } = await supabase
                .from("daily_nutrition")
                .upsert({
                    user_id: user.id,
                    date: date,
                    calories: newCalories,
                    protein: newProtein,
                    carbs: newCarbs,
                    fats: newFats
                });

            if (upsertError) throw upsertError;

            toast.success("Meal logged successfully");
            setCalories("");
            setProtein("");
            setCarbs("");
            setFats("");
            onLogComplete?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to log meal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <ChefHat className="h-5 w-5 text-emerald-500" />
                    Quick Add Meal
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <div className="space-y-2">
                            <Label htmlFor="calories" className="text-neutral-400 flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-500" /> Calories
                            </Label>
                            <Input
                                id="calories"
                                type="number"
                                placeholder="0"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                                className="bg-neutral-950 border-neutral-800 text-white"
                                inputMode="decimal"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="protein" className="text-neutral-400 flex items-center gap-1">
                                <Beef className="w-3 h-3 text-red-500" /> Protein (g)
                            </Label>
                            <Input
                                id="protein"
                                type="number"
                                placeholder="0"
                                value={protein}
                                onChange={(e) => setProtein(e.target.value)}
                                className="bg-neutral-950 border-neutral-800 text-white"
                                inputMode="decimal"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="carbs" className="text-neutral-400">Carbs (g)</Label>
                            <Input
                                id="carbs"
                                type="number"
                                placeholder="0"
                                value={carbs}
                                onChange={(e) => setCarbs(e.target.value)}
                                className="bg-neutral-950 border-neutral-800 text-white"
                                inputMode="decimal"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fats" className="text-neutral-400">Fats (g)</Label>
                            <Input
                                id="fats"
                                type="number"
                                placeholder="0"
                                value={fats}
                                onChange={(e) => setFats(e.target.value)}
                                className="bg-neutral-950 border-neutral-800 text-white"
                                inputMode="decimal"
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {loading ? "Adding..." : "Add Meal"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
