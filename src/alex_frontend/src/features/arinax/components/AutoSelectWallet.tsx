import React from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Label } from "@/lib/components/label";
import { setAuto } from "../arinaxSlice";

const AutoSelectWallet = () => {
    const dispatch = useAppDispatch();
    const { auto } = useAppSelector(state => state.arinax);

	return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <input onChange={()=>dispatch(setAuto(!auto))} className="cursor-pointer w-4 h-4" type="checkbox" id="auto" name="auto" checked={auto} />
                <Label htmlFor="auto">Auto select wallet</Label>
            </div>
            <span className="text-sm text-gray-500">
                If enabled, the wallet will be selected automatically based on the file size.
            </span>
        </div>
    );
};

export default AutoSelectWallet;
