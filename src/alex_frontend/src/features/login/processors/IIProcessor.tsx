import React from "react";
import { LoaderCircle, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/lib/components/button";
import useAuth from "@/hooks/useAuth";
import { useInternetIdentity } from "ic-use-internet-identity";
import { toast } from "sonner";

const IIProcessor = () => {
    const { setProvider } = useAuth();
    const { login, isLoggingIn } = useInternetIdentity();

    const handleLogin = async () => {
        try {
            setProvider('II');
            await login();
        } catch (error) {
            toast.error('Authentication failed. Please try again.', {
                description: 'If the problem persists, please check your Internet Identity connection.'
            });
            console.error(error);
        }
    }

    return (
        <Button
            onClick={handleLogin}
            variant="outline"
            disabled={isLoggingIn}
            className="w-full h-auto justify-between mb-2 p-4 border border-border dark:hover:border-primary transition-colors group"
        >
            <div className="w-full flex items-center gap-3">
                <div className="relative basis-10 flex-grow-0 flex-shrink-0">
                    <img
                        src="/images/ic.svg"
                        alt="Internet Identity"
                        className="w-10 h-10 rounded-lg bg-background p-1.5 border border-border/50"
                    />
                    {isLoggingIn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                            <LoaderCircle className="animate-spin text-constructive" size={20} />
                        </div>
                    )}
                </div>
                <div className="flex-grow flex flex-col items-start">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Internet Identity</span>
                        <Shield size={14} className="text-constructive" />
                    </div>
                    <div className="w-full flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            Secure authentication powered by DFINITY
                        </span>
                        {!isLoggingIn && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary">
                                <span>Click to login</span>
                                <ArrowRight size={18}/>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <CheckCircle2 size={12} className="text-constructive" />
                        <span className="text-xs text-muted-foreground">
                            No password required
                        </span>
                    </div>
                </div>
            </div>
        </Button>
    );
}

export default IIProcessor;