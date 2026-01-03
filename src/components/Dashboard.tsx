import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Dumbbell, Flame } from "lucide-react";

export function Dashboard() {
    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Welcome Back</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-neutral-900 border-neutral-800 text-neutral-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Weekly Workouts</CardTitle>
                        <Dumbbell className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-neutral-400">+1 from last week</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800 text-neutral-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,250</div>
                        <p className="text-xs text-neutral-400">kcal</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800 text-neutral-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Streak</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5 Days</div>
                        <p className="text-xs text-neutral-400">Keep it up!</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
