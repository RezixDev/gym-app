import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { seedWorkouts } from "@/lib/seedData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LogOut, Settings, Activity, User as UserIcon, LineChart, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface ProfileProps {
    onNavigate?: (tab: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
    const { user, signOut } = useAuth();
    const [workoutCount, setWorkoutCount] = useState<number>(0);
    const [unitPreference, setUnitPreference] = useState<"kg" | "lbs">("kg");
    const [weight, setWeight] = useState<string>("");
    const [height, setHeight] = useState<string>("");
    const [calorieGoal, setCalorieGoal] = useState<string>("");
    const [proteinGoal, setProteinGoal] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        if (!user) return;

        // Fetch workout count
        const fetchStats = async () => {
            const { count, error } = await supabase
                .from("workouts")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id);

            if (!error && count !== null) {
                setWorkoutCount(count);
            }
        };

        // Fetch profile settings
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("unit_preference, weight, height, calorie_goal, protein_goal")
                .eq("id", user.id)
                .single();

            if (data) {
                setUnitPreference(data.unit_preference as "kg" | "lbs");
                if (data.weight) setWeight(data.weight.toString());
                if (data.height) setHeight(data.height.toString());
                if (data.calorie_goal) setCalorieGoal(data.calorie_goal.toString());
                if (data.protein_goal) setProteinGoal(data.protein_goal.toString());
            } else if (error && error.code === 'PGRST116') {
                // Profile doesn't exist
            }
            setLoading(false);
        };

        fetchStats();
        fetchProfile();
    }, [user]);

    const handleProfileUpdate = async (updates: any) => {
        if (!user) return;

        const { error } = await supabase
            .from("profiles")
            .upsert({ id: user.id, ...updates });

        if (error) {
            toast.error("Failed to update profile");
            return false;
        } else {
            return true;
        }
    };

    const handleUnitChange = async (checked: boolean) => {
        const newUnit = checked ? "lbs" : "kg";
        setUnitPreference(newUnit);

        const success = await handleProfileUpdate({ unit_preference: newUnit });
        if (!success) {
            setUnitPreference(checked ? "kg" : "lbs"); // Revert
        } else {
            toast.success(`Unit preference saved: ${newUnit}`);
        }
    };

    const handleStatChange = async (field: "weight" | "height" | "calorie_goal" | "protein_goal", value: string) => {
        if (field === "weight") setWeight(value);
        if (field === "height") setHeight(value);
        if (field === "calorie_goal") setCalorieGoal(value);
        if (field === "protein_goal") setProteinGoal(value);
    };

    const handleStatBlur = async (field: "weight" | "height" | "calorie_goal" | "protein_goal", value: string) => {
        if (!value) return;
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        const success = await handleProfileUpdate({ [field]: numValue });
        if (success) {
            toast.success(`${field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} updated`);
        }
    };

    if (!user) return null;

    const initials = user.email
        ?.split("@")[0]
        .slice(0, 2)
        .toUpperCase() || "U";

    return (
        <div className="p-4 space-y-6 max-w-md mx-auto fade-in">
            <header className="flex items-center space-x-4 mb-8">
                <Avatar className="h-16 w-16 border-2 border-emerald-500/20">
                    <AvatarImage src={user.user_metadata.avatar_url} />
                    <AvatarFallback className="bg-emerald-950 text-emerald-400 font-bold text-xl">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Profile</h1>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
            </header>

            <div className="space-y-4">
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                            <Activity className="h-5 w-5 text-emerald-500" />
                            Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">Total Workouts</span>
                            <span className="text-2xl font-bold text-foreground font-mono">{workoutCount}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Mobile Navigation Links */}
                <div className="md:hidden">
                    <Button
                        variant="outline"
                        className="w-full justify-start text-muted-foreground border-border bg-card hover:bg-accent hover:text-accent-foreground"
                        onClick={() => onNavigate?.("analytics")}
                    >
                        <LineChart className="mr-2 h-4 w-4 text-emerald-500" />
                        View Progress Analytics
                    </Button>
                </div>

                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                            <UserIcon className="h-5 w-5 text-emerald-500" />
                            Body Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight" className="text-muted-foreground">Weight ({unitPreference})</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={weight}
                                    onChange={(e) => handleStatChange("weight", e.target.value)}
                                    onBlur={(e) => handleStatBlur("weight", e.target.value)}
                                    className="bg-background border-border text-foreground"
                                    placeholder="0"
                                    inputMode="decimal"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height" className="text-muted-foreground">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={height}
                                    onChange={(e) => handleStatChange("height", e.target.value)}
                                    onBlur={(e) => handleStatBlur("height", e.target.value)}
                                    className="bg-background border-border text-foreground"
                                    placeholder="0"
                                    inputMode="decimal"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                            <Settings className="h-5 w-5 text-emerald-500" />
                            Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Nutrition Goals</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="calories" className="text-muted-foreground">Daily Calories (kcal)</Label>
                                    <Input
                                        id="calories"
                                        type="number"
                                        value={calorieGoal}
                                        onChange={(e) => handleStatChange("calorie_goal", e.target.value)}
                                        onBlur={(e) => handleStatBlur("calorie_goal", e.target.value)}
                                        className="bg-background border-border text-foreground"
                                        placeholder="2000"
                                        inputMode="numeric"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="protein" className="text-muted-foreground">Daily Protein (g)</Label>
                                    <Input
                                        id="protein"
                                        type="number"
                                        value={proteinGoal}
                                        onChange={(e) => handleStatChange("protein_goal", e.target.value)}
                                        onBlur={(e) => handleStatBlur("protein_goal", e.target.value)}
                                        className="bg-background border-border text-foreground"
                                        placeholder="150"
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between space-x-2 bg-background p-3 rounded-lg border border-border">
                            <Label htmlFor="unit-mode" className="flex flex-col space-y-1 cursor-pointer">
                                <span className="text-foreground font-medium">Unit Preference</span>
                                <span className="font-normal text-xs text-muted-foreground">
                                    Show weights in Lbs instead of Kg
                                </span>
                            </Label>
                            <Switch
                                id="unit-mode"
                                checked={unitPreference === "lbs"}
                                onCheckedChange={handleUnitChange}
                                disabled={loading}
                                className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-secondary"
                            />
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-foreground">Appearance</label>
                                <p className="text-xs text-muted-foreground">Customize how the app looks</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setTheme("light")}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${theme === 'light'
                                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                                        : 'bg-background border-border text-muted-foreground hover:border-accent-foreground/50'
                                        }`}
                                >
                                    <Sun className="w-5 h-5 mb-2" />
                                    <span className="text-xs font-medium">Light</span>
                                </button>
                                <button
                                    onClick={() => setTheme("dark")}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${theme === 'dark'
                                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                                        : 'bg-background border-border text-muted-foreground hover:border-accent-foreground/50'
                                        }`}
                                >
                                    <Moon className="w-5 h-5 mb-2" />
                                    <span className="text-xs font-medium">Dark</span>
                                </button>
                                <button
                                    onClick={() => setTheme("system")}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${theme === 'system'
                                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                                        : 'bg-background border-border text-muted-foreground hover:border-accent-foreground/50'
                                        }`}
                                >
                                    <Monitor className="w-5 h-5 mb-2" />
                                    <span className="text-xs font-medium">System</span>
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button
                    variant="outline"
                    className="w-full border-emerald-900/50 text-emerald-500 hover:bg-emerald-950 hover:text-emerald-400 h-12 dashed"
                    onClick={async () => {
                        if (!user) return;
                        const promise = seedWorkouts(user.id);
                        toast.promise(promise, {
                            loading: 'Seeding test data...',
                            success: 'Test data seeded successfully!',
                            error: 'Failed to seed data',
                        });
                    }}
                >
                    <Activity className="mr-2 h-4 w-4" />
                    Seed Test Data (30 Days)
                </Button>

                <Button
                    variant="outline"
                    className="w-full border-red-900/50 text-red-500 hover:bg-red-950 hover:text-red-400 h-12"
                    onClick={signOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
