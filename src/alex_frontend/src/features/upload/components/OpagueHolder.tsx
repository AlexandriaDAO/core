import { LoaderCircle } from "lucide-react";
import React from "react";

interface OpagueHolderProps {
    loading: boolean;
    children: React.ReactNode;
}

const OpagueHolder: React.FC<OpagueHolderProps> = ({ loading, children }) => {
    return (
        <div className={`relative ${loading ? 'cursor-not-allowed pointer-events-none' : ''}`}>
            <div className={`flex flex-col gap-2 ${loading ? 'opacity-40' : ''}`}>
                {children}
            </div>

            {loading && (
                <div className="w-full h-full absolute inset-0 backdrop-blur flex justify-center items-center border border-solid border-gray-400 rounded">
                    <span className="bg-black/100 shadow rounded p-2">
                        <LoaderCircle size={14} className="animate animate-spin text-white" />
                    </span>
                </div>
            )}
        </div>
    );
};

export default OpagueHolder;
