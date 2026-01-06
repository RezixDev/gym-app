import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Dumbbell } from "lucide-react";
import { NutritionSummary } from "@/components/nutrition/NutritionSummary";

export function Dashboard() {
    const { t } = useTranslation();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-foreground mb-6">{t('dashboard.welcome')}</h1>

            <div className="grid gap-4 md:grid-cols-2">
                {/* 1. Weekly Workouts */}
                <Card className="bg-card border-border text-card-foreground">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.weeklyWorkouts')}</CardTitle>
                        <Dumbbell className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">{t('dashboard.lastWeekDiff')}</p>
                    </CardContent>
                </Card>

                {/* 2. Active Streak */}
                <Card className="bg-neutral-900 border-neutral-800 text-neutral-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.activeStreak')}</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5 {t('dashboard.days')}</div>
                        <p className="text-xs text-muted-foreground">{t('dashboard.keepItUp')}</p>
                    </CardContent>
                </Card>

                {/* 3. Nutrition Summary */}
                <NutritionSummary refreshTrigger={refreshTrigger} />
            </div>
        </div>
    );
}
