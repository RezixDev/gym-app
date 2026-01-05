import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Dumbbell } from "lucide-react";
import { NutritionSummary } from "@/components/nutrition/NutritionSummary";

export function Dashboard() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-foreground mb-6">Welcome Back</h1>

            <div className="grid gap-4 md:grid-cols-2">
                {/* 1. Weekly Workouts */}
                <Card className="bg-card border-border text-card-foreground">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Weekly Workouts</CardTitle>
                        <Dumbbell className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">+1 from last week</p>
                    </CardContent>
                </Card>

                {/* 2. Active Streak */}
                <Card className="bg-neutral-900 border-neutral-800 text-neutral-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Streak</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5 Days</div>
                        <p className="text-xs text-muted-foreground">Keep it up!</p>
                    </CardContent>
                </Card>

                {/* 3. Nutrition Summary */}
                <NutritionSummary refreshTrigger={refreshTrigger} />
            </div>
        </div>
    );
}
