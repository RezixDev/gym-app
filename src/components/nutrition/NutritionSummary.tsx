import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Beef, Loader2 } from "lucide-react";

export function NutritionSummary({ refreshTrigger }: { refreshTrigger?: number }) {
    const { t } = useTranslation();
    const [stats, setStats] = useState({ calories: 0, protein: 0 });
    const [goals, setGoals] = useState({ calories: 2000, protein: 150 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date().toISOString().split('T')[0];

            // Fetch goals
            const { data: profile } = await supabase
                .from("profiles")
                .select("calorie_goal, protein_goal")
                .eq("id", user.id)
                .single();

            if (profile) {
                setGoals({
                    calories: profile.calorie_goal || 2000,
                    protein: profile.protein_goal || 150
                });
            }

            // Fetch today's log
            const { data: log } = await supabase
                .from("daily_nutrition")
                .select("calories, protein")
                .eq("user_id", user.id)
                .eq("date", today)
                .single();

            if (log) {
                setStats({
                    calories: log.calories,
                    protein: log.protein
                });
            } else {
                setStats({ calories: 0, protein: 0 });
            }
            setLoading(false);
        };

        fetchData();
    }, [refreshTrigger]);

    if (loading) {
        return (
            <Card className="bg-card border-border">
                <CardContent className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </CardContent>
            </Card>
        );
    }

    const caloriePercent = Math.min(100, (stats.calories / goals.calories) * 100);
    const proteinPercent = Math.min(100, (stats.protein / goals.protein) * 100);

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-card-foreground">{t('nutrition.dailyNutrition')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-500" /> {t('nutrition.calories')}
                        </span>
                        <span className="text-foreground font-medium">
                            {Math.round(stats.calories)} / <span className="text-muted-foreground">{goals.calories}</span>
                        </span>
                    </div>
                    <Progress value={caloriePercent} className="h-2 bg-secondary" indicatorClassName="bg-orange-500" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <Beef className="w-4 h-4 text-red-500" /> {t('nutrition.protein')}
                        </span>
                        <span className="text-foreground font-medium">
                            {Math.round(stats.protein * 10) / 10}g / <span className="text-muted-foreground">{goals.protein}g</span>
                        </span>
                    </div>
                    <Progress value={proteinPercent} className="h-2 bg-secondary" indicatorClassName="bg-red-500" />
                </div>
            </CardContent>
        </Card>
    );
}
