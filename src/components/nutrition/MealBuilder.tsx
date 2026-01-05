import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChefHat, Trash2, Save, Star, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { FoodSearch } from "./FoodSearch";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type FoodItem = Database["public"]["Tables"]["food_items"]["Row"];

interface MealItem {
    food: FoodItem;
    quantity: number;
}

// Type for fetched history
interface MealLogWithItems {
    id: string;
    meal_type: string;
    created_at: string | null;
    meal_items: {
        quantity: number;
        food_items: FoodItem | null;
    }[];
}

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

export function MealBuilder({ onLogComplete }: { onLogComplete?: () => void }) {
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [mealType, setMealType] = useState("Breakfast");
    const [items, setItems] = useState<MealItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<MealLogWithItems[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const handleAddItem = (item: FoodItem) => {
        setItems([...items, { food: item, quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleQuantityChange = (index: number, qty: number) => {
        if (qty < 0) return;
        const newItems = [...items];
        newItems[index].quantity = qty;
        setItems(newItems);
    };

    // Calculate Totals for Current Plate
    const totalCalories = items.reduce((sum, item) => sum + (item.food.calories * item.quantity), 0);
    const totalQualityScore = items.length > 0
        ? Math.round(items.reduce((sum, item) => sum + item.food.quality_score, 0) / items.length)
        : 0;

    const fetchHistory = useCallback(async () => {
        setLoadingHistory(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("meal_logs")
            .select(`
                *,
                meal_items (
                    quantity,
                    food_items (*)
                )
            `)
            .eq("user_id", user.id)
            .eq("date", date)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching history:", error);
            toast.error("Failed to load history");
        } else {
            // Cast the result to our interface because Supabase types with joins can be complex
            setHistory(data as any as MealLogWithItems[]);
        }
        setLoadingHistory(false);
    }, [date]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleSaveMeal = async () => {
        if (items.length === 0) {
            toast.error("Add at least one food item");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Create Meal Log
            const { data: mealLog, error: logError } = await supabase
                .from("meal_logs")
                .insert({
                    user_id: user.id,
                    date: date,
                    meal_type: mealType
                } as any)
                .select()
                .single();

            if (logError) throw logError;
            if (!mealLog) throw new Error("Failed to create meal log");

            // 2. Create Meal Items
            const mealItemsData = items.map(item => ({
                meal_log_id: mealLog.id,
                food_item_id: item.food.id,
                quantity: item.quantity
            }));

            const { error: itemsError } = await supabase
                .from("meal_items")
                .insert(mealItemsData as any);

            if (itemsError) throw itemsError;

            // 3. Update Daily Nutrition Totals
            // Fetch existing
            const { data: existingDaily } = await supabase
                .from("daily_nutrition")
                .select("*")
                .eq("user_id", user.id)
                .eq("date", date)
                .single();

            // Calculate totals for this meal
            const thisMealProteins = items.reduce((sum, item) => sum + (item.food.protein * item.quantity), 0);
            const thisMealCarbs = items.reduce((sum, item) => sum + (item.food.carbs * item.quantity), 0);
            const thisMealFats = items.reduce((sum, item) => sum + (item.food.fats * item.quantity), 0);

            const newCalories = (existingDaily?.calories || 0) + totalCalories;
            const newProtein = (existingDaily?.protein || 0) + thisMealProteins;
            const newCarbs = (existingDaily?.carbs || 0) + thisMealCarbs;
            const newFats = (existingDaily?.fats || 0) + thisMealFats;

            const { error: dailyError } = await supabase
                .from("daily_nutrition")
                .upsert({
                    user_id: user.id,
                    date: date,
                    calories: newCalories,
                    protein: newProtein,
                    carbs: newCarbs,
                    fats: newFats
                } as any, { onConflict: 'user_id, date' });

            if (dailyError) throw dailyError;

            toast.success("Meal saved!");
            setItems([]);
            onLogComplete?.();
            fetchHistory(); // Refresh history

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save meal");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLog = async (logId: string, logItems: any[]) => {
        if (!confirm("Are you sure you want to delete this meal?")) return;

        setLoadingHistory(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Calculate totals to subtract
            const caloriesToRemove = logItems.reduce((sum, item) => sum + ((item.food_items?.calories || 0) * item.quantity), 0);
            const proteinToRemove = logItems.reduce((sum, item) => sum + ((item.food_items?.protein || 0) * item.quantity), 0);
            const carbsToRemove = logItems.reduce((sum, item) => sum + ((item.food_items?.carbs || 0) * item.quantity), 0);
            const fatsToRemove = logItems.reduce((sum, item) => sum + ((item.food_items?.fats || 0) * item.quantity), 0);

            // 2. Fetch current daily totals
            const { data: currentDaily } = await supabase
                .from("daily_nutrition")
                .select("*")
                .eq("user_id", user.id)
                .eq("date", date)
                .single();

            // 3. Update daily nutrition
            if (currentDaily) {
                const newCalories = Math.max(0, currentDaily.calories - caloriesToRemove);
                const newProtein = Math.max(0, currentDaily.protein - proteinToRemove);
                const newCarbs = Math.max(0, currentDaily.carbs - carbsToRemove);
                const newFats = Math.max(0, currentDaily.fats - fatsToRemove);

                const { error: updateError } = await supabase
                    .from("daily_nutrition")
                    .update({
                        calories: newCalories,
                        protein: newProtein,
                        carbs: newCarbs,
                        fats: newFats
                    })
                    .eq("id", currentDaily.id);

                if (updateError) throw updateError;
            }

            // 4. Delete the meal log
            // Note: Assuming cascade delete is enabled for meal_items. 
            // If not, we would need to delete items first.
            const { error: deleteError } = await supabase
                .from("meal_logs")
                .delete()
                .eq("id", logId);

            if (deleteError) throw deleteError;

            toast.success("Meal deleted");

            // 5. Refresh
            await fetchHistory();
            onLogComplete?.();

        } catch (error: any) {
            console.error("Delete error:", error);
            toast.error(error.message || "Failed to delete meal");
        } finally {
            setLoadingHistory(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <ChefHat className="h-5 w-5 text-emerald-500" />
                        Meal Builder
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Configuration: Date & Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-neutral-400">Date</Label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-neutral-400">Meal Type</Label>
                            <Select value={mealType} onValueChange={setMealType}>
                                <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                    {MEAL_TYPES.map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="space-y-2">
                        <Label className="text-neutral-400">Add Item</Label>
                        <FoodSearch onSelect={handleAddItem} />
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                        <Label className="text-neutral-400 text-xs uppercase tracking-wider">Current Plate</Label>
                        {items.length === 0 ? (
                            <div className="text-sm text-neutral-500 italic py-4 text-center border border-dashed border-neutral-800 rounded">
                                No items added yet.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-neutral-950/50 p-2 rounded border border-neutral-800">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-white">{item.food.name}</div>
                                            <div className="text-xs text-neutral-500 flex gap-2">
                                                <span>{Math.round(item.food.calories * item.quantity)} kcal</span>
                                                <span>{Math.round(item.food.protein * item.quantity)}g P</span>
                                                <span className="text-yellow-500/80 flex items-center gap-0.5">
                                                    <Star className="w-3 h-3" /> {item.food.quality_score}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleQuantityChange(idx, item.quantity - 0.5)}
                                                    className="w-6 h-6 flex items-center justify-center bg-neutral-800 text-white rounded hover:bg-neutral-700"
                                                >-</button>
                                                <span className="w-8 text-center text-sm text-white font-mono">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(idx, item.quantity + 0.5)}
                                                    className="w-6 h-6 flex items-center justify-center bg-neutral-800 text-white rounded hover:bg-neutral-700"
                                                >+</button>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-950/50" onClick={() => handleRemoveItem(idx)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary & Save */}
                    <div className="pt-4 border-t border-neutral-800 space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <div className="text-xs text-neutral-400">Total Calories</div>
                                <div className="text-2xl font-bold text-white">{Math.round(totalCalories)}</div>
                            </div>
                            <div className="space-y-1 text-right">
                                <div className="text-xs text-neutral-400">Meal Quality</div>
                                <Badge variant="outline" className={`
                                    ${totalQualityScore >= 90 ? 'border-emerald-500 text-emerald-500' :
                                        totalQualityScore >= 70 ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'}
                                `}>
                                    {totalQualityScore}/100
                                </Badge>
                            </div>
                        </div>

                        <Button
                            onClick={handleSaveMeal}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={loading || items.length === 0}
                        >
                            {loading ? "Saving..." : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> Log Meal
                                </>
                            )}
                        </Button>
                    </div>

                </CardContent>
            </Card>

            {/* Daily Log History */}
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Clock className="h-5 w-5 text-neutral-400" />
                        Daily Log
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingHistory ? (
                        <div className="text-center py-4 text-neutral-500">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="text-sm text-neutral-500 italic py-4 text-center">
                            No meals logged for this date.
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full">
                            {history.map((log) => {
                                // Calculate log totals
                                const logCalories = log.meal_items.reduce((sum, item) => sum + ((item.food_items?.calories || 0) * item.quantity), 0);
                                const logProtein = log.meal_items.reduce((sum, item) => sum + ((item.food_items?.protein || 0) * item.quantity), 0);

                                return (
                                    <AccordionItem key={log.id} value={log.id} className="border-neutral-800">
                                        <AccordionTrigger className="hover:no-underline py-3">
                                            <div className="flex justify-between w-full pr-4 items-center">
                                                <div className="flex flex-col text-left">
                                                    <span className="text-sm font-medium text-white">{log.meal_type}</span>
                                                    <span className="text-xs text-neutral-400">
                                                        {log.meal_items.length} items
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="text-sm font-bold text-white">{Math.round(logCalories)} kcal</div>
                                                        <div className="text-xs text-emerald-500">{Math.round(logProtein)}g P</div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-neutral-500 hover:text-red-500 hover:bg-red-950/20 z-10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteLog(log.id, log.meal_items);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-3 text-neutral-300">
                                            <div className="space-y-2 pl-2 border-l-2 border-neutral-800">
                                                {log.meal_items.map((item, i) => (
                                                    <div key={i} className="flex justify-between text-sm">
                                                        <span>{item.quantity} x {item.food_items?.name || "Unknown Item"}</span>
                                                        <span className="text-neutral-500">{Math.round((item.food_items?.calories || 0) * item.quantity)} kcal</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
