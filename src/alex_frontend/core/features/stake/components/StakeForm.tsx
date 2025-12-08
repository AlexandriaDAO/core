import React, { useState, useCallback, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { LoaderCircle, RefreshCw, RotateCw } from "lucide-react";
import { useAlex, useIcpSwap } from "@/hooks/actors";
import stake from "../thunks/stake";
import unlocked from "../../balance/alex/thunks/unlocked";
import { Link } from "@tanstack/react-router";
import { Alert, AlertDescription } from "@/lib/components/alert";
import { Card, CardContent } from "@/lib/components/card";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import getStake from "../thunks/getStake";

const StakeForm: React.FC = () => {
    const { actor: actorAlex } = useAlex();
    const { actor: actorSwap } = useIcpSwap();
    const dispatch = useAppDispatch();

    const { staking } = useAppSelector((state) => state.stake);
    const { user } = useAppSelector((state) => state.auth);
    const alexBalance = useAppSelector((state) => state.balance.alex);

    const [amount, setAmount] = useState<string>("");

    const isLoading = useMemo(() =>
        staking,
        [staking]
    );

    const availableBalance = useMemo(() => 
        alexBalance.unlocked > 0 ? alexBalance.unlocked.toFixed(4) : "0.0000",
        [alexBalance.unlocked]
    );

    const isValidAmount = useMemo(() => {
        const numAmount = parseFloat(amount);
        return numAmount > 0 && numAmount <= alexBalance.unlocked;
    }, [amount, alexBalance.unlocked]);

    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        if (!user?.principal || !actorAlex || !actorSwap || !isValidAmount) return;
        try{
            await dispatch(stake({ actorSwap, actorAlex, amount, userPrincipal: user.principal })).unwrap();

            dispatch(getStake());
            dispatch(unlocked());

        }catch(error){}
        setAmount("");
    }, [user?.principal, actorAlex, actorSwap, amount, isValidAmount, dispatch]);

    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
            setAmount(value);
        }
    }, []);

    const LoginPrompt = () => (
        <div className="flex-grow border border-gray-400 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Login to Stake ALEX</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Connect your wallet to start staking ALEX tokens and earning ICP rewards</p>
        </div>
    );

    const LoadingView = () => (
        <div className="flex-grow border border-gray-400 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-2 p-6">
            <RotateCw size={32} className="animate-spin " />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction in Progress</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
                Processing your stake transaction...
            </p>
        </div>
    );

    return (
        <>
            <style>
                {`
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type="number"] {
                    -moz-appearance: textfield;
                }
                `}
            </style>
            <div className={`stake-form flex flex-col gap-5`}>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stake ALEX</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Earn ICP rewards by staking ALEX tokens.
                    </p>
                </div>


                {!user ? (
                    <LoginPrompt />
                ) : isLoading ? (
                    <LoadingView />
                ) : (
                    <Card className="flex-grow flex justify-center items-center">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="stake-amount">Amount to stake</Label>
                                        <div className={`flex items-center space-x-2 ${alexBalance.unlockedLoading ? 'opacity-50':'opacity-100'}`}>
                                            <span className="text-sm text-muted-foreground">Available:</span>
                                            <span className="text-sm font-medium">{availableBalance} ALEX</span>
                                            <img className="w-4 h-4" src="images/alex-logo.svg" alt="ALEX" />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                scale="icon"
                                                onClick={()=>dispatch(unlocked())}
                                                disabled={alexBalance.unlockedLoading}
                                            >
                                                <RefreshCw size={14} className={`${alexBalance.unlockedLoading ? 'animate-spin':''}`} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Input
                                            id="stake-amount"
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={amount}
                                            onChange={handleAmountChange}
                                            placeholder="0.0000"
                                            disabled={isLoading}
                                            className="pr-20 text-xl"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex justify-between items-center gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                ALEX
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                scale="sm"
                                                onClick={()=>setAmount(availableBalance)}
                                                disabled={isLoading}
                                            >
                                                Max
                                            </Button>
                                        </div>
                                    </div>
                                    {!isValidAmount && amount && (
                                        <Alert>
                                            <AlertDescription>
                                                Please enter a valid amount between 0 and {availableBalance} ALEX
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!isValidAmount || isLoading}
                                    variant='info'
                                    scale="md"
                                    className={`w-full ${!isValidAmount || isLoading ? 'opacity-50':'opacity-100'}`}
                                >
                                    {isLoading && <LoaderCircle size={16} className="animate-spin" />}
                                    {isLoading ? 'Processing...' : 'Stake ALEX'}
                                </Button>

                                <Alert>
                                    <AlertDescription>
                                        If the transaction doesn't complete as expected, please check the <Link to='/swap/redeem'><strong>Redeem Page</strong></Link> to locate your tokens
                                    </AlertDescription>
                                </Alert>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
};

export default StakeForm;