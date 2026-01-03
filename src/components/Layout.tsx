import { useState } from "react";
import { Home, Dumbbell, List, User } from "lucide-react";
import { Dashboard } from "./Dashboard";
import { ExerciseLibrary } from "./ExerciseLibrary";

export function Layout() {
    const [activeTab, setActiveTab] = useState("dashboard");

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <Dashboard />;
            case "workouts":
                return <div className="p-4 text-neutral-400">Workouts Placeholder</div>;
            case "exercises":
                return <ExerciseLibrary />;
            case "profile":
                return <div className="p-4 text-neutral-400">Profile Placeholder</div>;
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
                        onClick={() => setActiveTab("exercises")}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "exercises" ? "text-emerald-500" : "text-neutral-500 hover:text-neutral-300"
                            }`}
                    >
                        <List className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Exercises</span>
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
