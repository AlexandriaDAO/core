import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Alert } from "@/components/Alert";
import { clearBurnError } from "../../../features/balance/lbry/lbrySlice";
import { X } from "lucide-react";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

const BurnError: React.FC = () => {
    const dispatch = useAppDispatch();
	const { burnError } = useAppSelector(state => state.balance.lbry);

    if(!burnError) return;

    return (
        <div className="relative mb-6">
            <Alert variant="danger" title="Error">{burnError}</Alert>
            <Button
                variant="muted"
                scale="icon"
                rounded="full"
                onClick={() =>
                    dispatch(clearBurnError())
                }
                className="absolute top-2 right-2"
            >
                <X size={16} />
            </Button>
        </div>
    )
};

export default BurnError;
