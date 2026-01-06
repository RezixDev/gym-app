import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";
import type { Database } from "@/lib/database.types";

type FoodItem = Database["public"]["Tables"]["food_items"]["Row"];

interface FoodSearchProps {
    onSelect: (item: FoodItem) => void;
}

export function FoodSearch({ onSelect }: FoodSearchProps) {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<FoodItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const search = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            const { data } = await supabase
                .from("food_items")
                .select("*")
                .ilike("name", `%${query}%`)
                .limit(5);

            if (data) {
                setResults(data);
            }
            setLoading(false);
        };

        const timeout = setTimeout(search, 300);
        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <div className="relative space-y-2">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                    placeholder={t('nutrition.searchPlaceholder')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 bg-neutral-950 border-neutral-800 text-white"
                />
            </div>

            {results.length > 0 && (
                <Card className="absolute z-10 w-full bg-neutral-900 border-neutral-800 max-h-60 overflow-y-auto mt-1 shadow-xl">
                    <div className="p-1">
                        {results.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onSelect(item);
                                    setQuery("");
                                    setResults([]);
                                }}
                                className="w-full flex items-center justify-between p-2 hover:bg-neutral-800 rounded text-left group"
                            >
                                <div>
                                    <div className="font-medium text-white">{item.name}</div>
                                    <div className="text-xs text-neutral-400">
                                        {item.calories} kcal • {item.protein}g P • {item.quality_score} Score
                                    </div>
                                </div>
                                <Plus className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
