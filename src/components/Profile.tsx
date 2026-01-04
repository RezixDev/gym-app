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
import { LogOut, Settings, Activity, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export function Profile() {
    const { user, signOut } = useAuth();
    const [workoutCount, setWorkoutCount] = useState<number>(0);
    const [unitPreference, setUnitPreference] = useState<"kg" | "lbs">("kg");
    const [weight, setWeight] = useState<string>("");
    const [height, setHeight] = useState<string>("");
    const [loading, setLoading] = useState(true);

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
                .select("unit_preference, weight, height")
                .eq("id", user.id)
                .single();

            if (data) {
                setUnitPreference(data.unit_preference as "kg" | "lbs");
                if (data.weight) setWeight(data.weight.toString());
                if (data.height) setHeight(data.height.toString());
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

    const handleStatChange = async (field: "weight" | "height", value: string) => {
        if (field === "weight") setWeight(value);
        if (field === "height") setHeight(value);
    };

    const handleStatBlur = async (field: "weight" | "height", value: string) => {
        if (!value) return;
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        const success = await handleProfileUpdate({ [field]: numValue });
        if (success) {
            toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
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
                    <h1 className="text-2xl font-bold text-white">Profile</h1>
                    <p className="text-neutral-400 text-sm">{user.email}</p>
                </div>
            </header>

            <div className="space-y-4">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-white">
                            <Activity className="h-5 w-5 text-emerald-500" />
                            Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-neutral-400">Total Workouts</span>
                            <span className="text-2xl font-bold text-white font-mono">{workoutCount}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-white">
                            <UserIcon className="h-5 w-5 text-emerald-500" />
                            Body Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight" className="text-neutral-400">Weight ({unitPreference})</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={weight}
                                    onChange={(e) => handleStatChange("weight", e.target.value)}
                                    onBlur={(e) => handleStatBlur("weight", e.target.value)}
                                    className="bg-neutral-950 border-neutral-800 text-white"
                                    placeholder="0"
                                    inputMode="decimal"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height" className="text-neutral-400">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={height}
                                    onChange={(e) => handleStatChange("height", e.target.value)}
                                    onBlur={(e) => handleStatBlur("height", e.target.value)}
                                    className="bg-neutral-950 border-neutral-800 text-white"
                                    placeholder="0"
                                    inputMode="decimal"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-white">
                            <Settings className="h-5 w-5 text-emerald-500" />
                            Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                            <Label htmlFor="unit-mode" className="flex flex-col space-y-1 cursor-pointer">
                                <span className="text-white font-medium">Unit Preference</span>
                                <span className="font-normal text-xs text-neutral-500">
                                    Show weights in Lbs instead of Kg
                                </span>
                            </Label>
                            <Switch
                                id="unit-mode"
                                checked={unitPreference === "lbs"}
                                onCheckedChange={handleUnitChange}
                                disabled={loading}
                                className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-neutral-700"
                            />
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
