import React from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/lib/components/button";
import useAuth from "@/hooks/useAuth";
import { useInternetIdentity } from "ic-use-internet-identity";

const IIProcessor = () => {
    const { setProvider } = useAuth();
    const { login, isLoggingIn } = useInternetIdentity();

    const handleLogin = () => {
        setProvider('II');

        login();
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
                Signin with Internet Identity
            </>
            <LogIn size={20}/>
        </Button>
    );
}

export default IIProcessor;