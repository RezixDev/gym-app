import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChefHat, Trash2, Save, Star } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { FoodSearch } from "./FoodSearch";
import { Badge } from "@/components/ui/badge";

type FoodItem = Database["public"]["Tables"]["food_items"]["Row"];

interface MealItem {
    food: FoodItem;
    quantity: number;
}

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

export function MealBuilder({ onLogComplete }: { onLogComplete?: () => void }) {
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [mealType, setMealType] = useState("Breakfast");
    const [items, setItems] = useState<MealItem[]>([]);
    const [loading, setLoading] = useState(false);

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

    // Calculate Totals
    const totalCalories = items.reduce((sum, item) => sum + (item.food.calories * item.quantity), 0);
    const totalProtein = items.reduce((sum, item) => sum + (item.food.protein * item.quantity), 0);
    const totalQualityScore = items.length > 0
        ? Math.round(items.reduce((sum, item) => sum + item.food.quality_score, 0) / items.length)
        : 0;

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

            const newCalories = (existingDaily?.calories || 0) + totalCalories;
            const newProtein = (existingDaily?.protein || 0) + totalProtein;
            const newCarbs = (existingDaily?.carbs || 0) + items.reduce((sum, item) => sum + (item.food.carbs * item.quantity), 0);
            const newFats = (existingDaily?.fats || 0) + items.reduce((sum, item) => sum + (item.food.fats * item.quantity), 0);

            const { error: dailyError } = await supabase
                .from("daily_nutrition")
                .upsert({
                    user_id: user.id,
                    date: date,
                    calories: newCalories,
                    protein: newProtein,
                    carbs: newCarbs,
                    fats: newFats
                } as any);

            if (dailyError) throw dailyError;

            toast.success("Meal saved!");
            setItems([]);
            onLogComplete?.();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save meal");
        } finally {
            setLoading(false);
        }
    };

    return (
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
                                            <span>{item.food.calories * item.quantity} kcal</span>
                                            <span>{item.food.protein * item.quantity}g P</span>
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
    );
}
