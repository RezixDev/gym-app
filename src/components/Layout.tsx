import { useState } from "react";

import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
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
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Main Content Area */}
            <main className="pb-24 pt- safe-top">
                {renderContent()}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border pb-safe-bottom z-50">
                <div className="flex justify-around items-center h-16">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "dashboard" ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Home className="w-6 h-6" />
                        <span className="text-[10px] font-medium">{t('nav.dashboard')}</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("workouts")}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "workouts" ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Dumbbell className="w-6 h-6" />
                        <span className="text-[10px] font-medium">{t('nav.workouts')}</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("meal_builder")}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "meal_builder" ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <ChefHat className="w-6 h-6" />
                        <span className="text-[10px] font-medium">{t('nav.nutrition')}</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("exercises")}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "exercises" ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <List className="w-6 h-6" />
                        <span className="text-[10px] font-medium">{t('nav.exercises')}</span>
                    </button>

                    {/* Analytics - Desktop Only */}
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`hidden md:flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "analytics" ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <LineChart className="w-6 h-6" />
                        <span className="text-[10px] font-medium">{t('nav.analytics')}</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("measurements")}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "measurements" ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Scale className="w-6 h-6" />
                        <span className="text-[10px] font-medium">{t('nav.measurements')}</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "profile" ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <User className="w-6 h-6" />
                        <span className="text-[10px] font-medium">{t('nav.profile')}</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
