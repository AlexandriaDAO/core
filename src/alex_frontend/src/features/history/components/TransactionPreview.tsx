import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useTheme } from "@/providers/ThemeProvider";
import { Check } from "lucide-react";

const TransactionPreview = () => {
    const { selectedTransaction } = useAppSelector(state => state.history);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    if (!selectedTransaction) {
        return (
            <div className="space-y-6">
                {/* Header Section */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-foreground">Transaction Preview</h2>
                    <p className="text-sm text-muted-foreground">
                        A preview of selected Transaction will be displayed here.
                    </p>
                </div>

                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 h-full flex items-center justify-center`}>
                    <div className="text-center">
                        <div className={`text-6xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>📄</div>
                        <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            No Transaction Selected
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Select a transaction from the list to view details
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">Transaction Details</h2>
                <p className="text-sm text-muted-foreground">
                    Showing the details of selected Transaction.
                </p>
            </div>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 h-full`}>
                <div className="grid grid-cols-1 gap-4">
                    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            Timestamp
                        </span>

                        <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTransaction.timestamp}
                        </p>
                    </div>

                    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mr-2`}>
                            Type
                        </span>

                        <span className={`${selectedTransaction.type === "mint" ? "bg-mintbtnbg" : "bg-sendbtnbg"} bg-opacity-30 px-3 py-1 rounded-bordertb text-sm font-medium`}>
                            {selectedTransaction.type}
                        </span>
                    </div>

                    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            Status
                        </span>

                        <div className={`flex items-center text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <span className="mr-2">Completed</span>

                            <Check size="20" className="text-constructive"/>
                        </div>
                    </div>

                    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            From
                        </span>

                        <p className={`text-base font-medium break-all ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTransaction.from}
                        </p>
                    </div>

                    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            To
                        </span>

                        <p className={`text-base font-medium break-all ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTransaction.to}
                        </p>
                    </div>

                    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            Amount
                        </span>

                        <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTransaction.amount}
                        </p>
                    </div>

                    <div>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            Fee
                        </span>

                        <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTransaction.fee}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionPreview;