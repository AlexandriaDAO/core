import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/card";

const Stakers: React.FC = () => {
    const { stakers } = useAppSelector((state) => state.stake);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Users size={20} className="text-blue-600 dark:text-blue-400" />
                    <span>Total Stakers</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-xl font-bold">
                    {stakers}
                </div>
            </CardContent>
        </Card>
    );
};

export default Stakers;