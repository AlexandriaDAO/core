import React from "react";
import { LoaderCircle } from "lucide-react";
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
            toast.error('Failed to login');
            console.error(error);
        }
    }

    return (
        <Button
            onClick={handleLogin}
            variant="link"
            disabled={isLoggingIn}
            className="w-full justify-between mb-2 py-6 text-left"
        >
            <div className="flex flex-col">
                <span className="font-medium">Internet Identity</span>
                <span className="text-xs opacity-80">Fast & secure authentication</span>
            </div>
            { isLoggingIn ? <LoaderCircle className="animate-spin" /> : <img src="/images/ic.svg" alt="Internet Identity" className="w-8 h-8" /> }
        </Button>
    );
}

export default IIProcessor;