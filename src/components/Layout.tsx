import { useState } from "react";

import { Dashboard } from "./Dashboard";
import { ExerciseLibrary } from "./ExerciseLibrary";
import { WorkoutLogger } from "./WorkoutLogger";
import { WorkoutHistory } from "./WorkoutHistory";
import { Profile } from "./Profile";
import { ProgressAnalytics } from "./ProgressAnalytics";
import { BodyMeasurements } from "./measurements/BodyMeasurements";
import { MealBuilder } from "./nutrition/MealBuilder";
import { Home, Dumbbell, List, User, LineChart, Scale, ChefHat } from "lucide-react";

export function Layout() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [workoutView, setWorkoutView] = useState<"history" | "logger">("history");

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <Dashboard />;
            case "workouts":
                return workoutView === "history" ? (
                    <WorkoutHistory onStartWorkout={() => setWorkoutView("logger")} />
                ) : (
                    <WorkoutLogger onFinish={() => setWorkoutView("history")} />
                );
            case "exercises":
                return <ExerciseLibrary />;
            case "meal_builder":
                return <MealBuilder />;
            case "profile":
                return <Profile onNavigate={setActiveTab} />;
            case "analytics":
                return <ProgressAnalytics />;
            case "measurements":
                return <BodyMeasurements />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
            {/* Main Content Area */}
            <main className="pb-24 pt- safe-top">
                {renderContent()}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900/90 backdrop-blur-lg border-t border-neutral-800 pb-safe-bottom z-50">
                <div className="flex justify-around items-center h-16">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "dashboard" ? "text-emerald-500" : "text-neutral-500 hover:text-neutral-300"
                            }`}
                    >
                        <Home className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Dashboard</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("workouts")}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "workouts" ? "text-emerald-500" : "text-neutral-500 hover:text-neutral-300"
                            }`}
                    >
                        <Dumbbell className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Workouts</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("meal_builder")}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "meal_builder" ? "text-emerald-500" : "text-neutral-500 hover:text-neutral-300"
                            }`}
                    >
                        <ChefHat className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Nutrition</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("exercises")}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "exercises" ? "text-emerald-500" : "text-neutral-500 hover:text-neutral-300"
                            }`}
                    >
                        <List className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Exercises</span>
                    </button>

                    {/* Analytics - Desktop Only */}
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`hidden md:flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "analytics" ? "text-emerald-500" : "text-neutral-500 hover:text-neutral-300"
                            }`}
                    >
                        <LineChart className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Analytics</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("measurements")}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "measurements" ? "text-emerald-500" : "text-neutral-500 hover:text-neutral-300"
                            }`}
                    >
                        <Scale className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Measure</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "profile" ? "text-emerald-500" : "text-neutral-500 hover:text-neutral-300"
                            }`}
                    >
                        <User className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Profile</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
