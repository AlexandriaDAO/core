import React from "react";
import { Shield, ShieldOff } from "lucide-react";
import { Switch } from "@/lib/components/switch";

interface SafeSearchToggleProps {
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
}

const SafeSearchToggle: React.FC<SafeSearchToggleProps> = ({ enabled, setEnabled }) => {
    return (
        <div className="flex items-center gap-2">
            {enabled ?(
                <>
                    <Shield className="h-4 min-h-4 w-4 min-w-4 text-constructive"/>
                    <span className="font-medium text-constructive whitespace-nowrap">Safe Search</span>
                </>
            ): (
                <>
                    <ShieldOff className="h-4 min-h-4 w-4 min-w-4 text-warning"/>
                    <span className="font-medium text-warning whitespace-nowrap">Safe Search Disabled</span>
                </>
            )}

            <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
                className="data-[state=checked]:bg-constructive data-[state=unchecked]:bg-destructive"
            />
        </div>
    );
};

export default SafeSearchToggle;