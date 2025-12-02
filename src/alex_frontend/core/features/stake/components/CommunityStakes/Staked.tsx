import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/card";


const Staked: React.FC = () => {
    const { staked } = useAppSelector((state) => state.stake);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Coins size={20} className="text-blue-600 dark:text-blue-400" />
                    <span>Total Staked</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-xl font-bold">
                    {staked} ALEX
                </div>
            </CardContent>
        </Card>
    );
};

export default Staked;