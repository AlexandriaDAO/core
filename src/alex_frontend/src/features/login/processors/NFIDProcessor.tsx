import React from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/lib/components/button";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { useIdentity } from "@/hooks/useIdentity";

const NFIDProcessor = () => {
    const { setProvider } = useAuth();
    const { login, isLoggingIn } = useIdentity();

    const handleLogin = async () => {
        try {
            // await login("http://localhost:9090/authenticate");
            await login();

            setProvider('NFID');
        } catch (error) {
            toast.error('Failed to login');
            console.error(error);
        }
    }

    return (
        <>
           <Button
                onClick={handleLogin}
                variant="link"
                disabled={isLoggingIn}
                className="w-full justify-between py-6 text-left"
            >
                <div className="flex flex-col">
                    <span className="font-medium">NFID</span>
                    <span className="text-xs opacity-80">Login with your Email</span>
                </div>
                { isLoggingIn ? <LoaderCircle className="animate-spin" /> : <img src="/images/nfid-logo.png" alt="NFID" className="w-8 h-8" /> }
            </Button>
        </>
    );
}

export default NFIDProcessor;