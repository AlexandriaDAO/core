import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { winstonToAr } from "@/features/wallets/utils";

function FileCost() {
    const {cost} = useAppSelector(state => state.upload);

    return (
        <p className="text-left text-sm text-muted-foreground">
            Estimated Cost: {cost ? winstonToAr(cost) : 'Estimating...'}
        </p>
    );
}

export default FileCost;