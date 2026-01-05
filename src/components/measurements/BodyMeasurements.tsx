import { useState } from "react";
import { MeasurementEntryForm } from "./MeasurementEntryForm";
import { MeasurementHistory } from "./MeasurementHistory";
import { Scale } from "lucide-react";

export function BodyMeasurements() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleEntryAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="container max-w-md mx-auto p-4 pb-24 space-y-6">
            <header className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-full">
                    <Scale className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Body Metrics</h1>
                    <p className="text-neutral-400 text-sm">Track your growth</p>
                </div>
            </header>

            <MeasurementEntryForm onEntryAdded={handleEntryAdded} />
            <MeasurementHistory refreshTrigger={refreshTrigger} />
        </div>
    );
}
