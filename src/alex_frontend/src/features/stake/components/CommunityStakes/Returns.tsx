import React, { useEffect, useMemo } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { HelpCircle, TrendingUp } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/lib/components/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/card";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getYield from "../../thunks/getYield";


const Returns: React.FC = () => {
    const dispatch = useAppDispatch();

    const { staked, yield: yieldValue } = useAppSelector((state) => state.stake);
    const {price: alexPrice} = useAppSelector((state) => state.balance.alex);
    const {price: icpPrice} = useAppSelector((state) => state.balance.icp);

    const aprData = useMemo(() => {
        const defaultAPR = {
            hourly: "0%",
            annual: "0%",
            isValid: false
        }
        if(alexPrice < 0 || icpPrice<0) return defaultAPR;

        const estimatedRewardIcp = staked * yieldValue;
        const stakedUsd = staked * alexPrice;

        if (stakedUsd > 0 && estimatedRewardIcp > 0) {
            const hourlyAprPercentage = ((estimatedRewardIcp * icpPrice) / stakedUsd) * 100;
            const annualAprPercentage = hourlyAprPercentage * 24 * 365;

            return {
                hourly: hourlyAprPercentage.toFixed(4) + "%",
                annual: annualAprPercentage.toFixed(2) + "%",
                isValid: true
            };
        }

        return defaultAPR;
    }, [alexPrice, icpPrice, yieldValue, staked]);


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
                    <span>Estimated Returns</span>
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <HelpCircle
                                    size={16}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-help"
                                />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p className="text-sm">
                                    APY is an estimate based on:<br />
                                    • Average rewards from the last 24 distribution cycles<br />
                                    • Current ICP & ALEX USD prices<br />
                                    • The reward pool adjusts by ~1% each cycle<br />
                                    <strong>Future returns may vary</strong>
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {aprData.isValid ?
                    <div className="space-y-2">
                        <div className="text-lg font-semibold">
                            {aprData.hourly} <span className="text-sm text-gray-500 dark:text-gray-400">per hour</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {aprData.annual} annually
                        </div>
                    </div>:
                    <span className="text-sm text-gray-500 dark:text-gray-400">Unknown</span>
                }
            </CardContent>
        </Card>
    );
};

export default Returns;