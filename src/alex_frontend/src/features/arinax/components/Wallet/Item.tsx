import React, { useMemo } from "react";
import { Check, RefreshCw, Server } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setWallet } from "../../arinaxSlice";
import { Button } from "@/lib/components/button";
import { SerializedWallet } from "@/features/wallets/walletsSlice";
import fetchBalance from "@/features/wallets/thunks/fetchBalance";
import { winstonToAr } from "@/features/wallets/utils";
import Arweave from "arweave";

const arweave = Arweave.init({});

const WalletItem: React.FC<{ item: SerializedWallet }> = ({ item }) => {
	const dispatch = useAppDispatch();
	const {wallet, cost} = useAppSelector(state => state.arinax);

    const isBalanceZero = useMemo(() => {
        return arweave.ar.isEqual(item.balance, '0');
    }, [item.balance]);

    const isBalanceLessThanCost = useMemo(() => {
        return cost && arweave.ar.isLessThan(item.balance, cost);
    }, [item.balance, cost]);

    const selectable = useMemo(() => {
        if(isBalanceZero) return false;

        if(!cost) return true;

        if(isBalanceLessThanCost) return false;

        return true;
    }, [item.balance, cost]);

    if (!item) return null;

    const handleSelect = () => {
        if (selectable) {
            if(wallet?.id === item.id){
                dispatch(setWallet(null));
            }else{
                dispatch(setWallet(item));
            }
        }
    };

    return (
        <div
            onClick={handleSelect}
            className={`relative p-4 rounded border transition-all ${selectable ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                ${wallet?.id === item.id ? 'border-constructive dark:border-constructive bg-constructive/20 dark:bg-constructive/20' : selectable
                    ? 'bg-white border-ring/80 dark:bg-gray-800 dark:border-secondary hover:border-constructive/50 dark:hover:border-constructive/50 hover:bg-constructive/10 dark:hover:bg-constructive/10'
                    // : 'border-ring/50 bg-gray-300'
                    : 'bg-white border-ring/60 dark:bg-gray-800 opacity-35 dark:opacity-70'
                    // : 'bg-destructive/10'
                }
            `}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Server className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                    <div>
                        <h3 className={`font-medium ${item.id === item.id ? 'text-black dark:text-white' : selectable ? 'text-black dark:text-white' : 'dark:text-white'}`}>{item.address && item.address.length > 15 ? item.address.toString().slice(0, 5) + "..." + item.address.toString().slice(-3): item.address}</h3>

                        {/* <p className={`text-sm ${balance && balance < minimumBalance ? 'text-red-500' : 'text-gray-500'}`}> */}
                        <p className={`text-sm text-gray-500`}>
                            Balance: {winstonToAr(item.balance)}
                            {/* {balance && balance < minimumBalance ? (
                                <span className="ml-2 text-xs">
                                (Minimum: {minimumBalance} AR)
                                </span>
                            ) : null} */}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="muted"
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(fetchBalance(item));
                        }}
                        disabled={item.balance == 'loading...'}
                        >
                        <RefreshCw className={`w-4 h-4 ${item.balance == 'loading...' ? 'animate-spin' : ''}`} strokeWidth={2} />
                    </Button>
                    {wallet?.id === item.id && (
                        <div className="text-constructive">
                            <Check className="w-5 h-5" strokeWidth={2} />
                        </div>
                    )}
                </div>
            </div>

            {item.balance != 'loading...' && !selectable && (
                <div className="mt-2 text-xs text-red-500">
                    {isBalanceZero ? (
                        "Balance is unavailable"
                    ) : isBalanceLessThanCost ? (
                        "Insufficient balance to process uploads"
                    ) : "No balance available"}
                </div>
            )}

            


        </div>
    )
};


export default WalletItem;
