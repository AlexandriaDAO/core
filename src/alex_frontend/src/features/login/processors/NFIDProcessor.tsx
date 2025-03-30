import React from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/lib/components/button";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
// import { NFIDLogin } from 'ic-auth';
import { useNFID } from "ic-use-nfid";

const NFIDProcessor = () => {
    const { setProvider } = useAuth();
    const { login, isLoggingIn } = useNFID();

    const handleLogin = async () => {
        try {
            setProvider('NFID');

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
            className="w-full justify-between"
        >
            <>
                { isLoggingIn && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> }
                Signin with NFID
            </>
            <LogIn size={20}/>
        </Button>
    );
}

export default NFIDProcessor;