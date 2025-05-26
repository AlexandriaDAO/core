import React, { useState } from "react";
import { LoaderCircle, Mail, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/lib/components/button";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNfidIdentity } from "ic-use-nfid-identity";

// Define a password for protected access during testing
const PROTECTED_PASSWORD = "testnfid"; // Change this as needed

const NFIDProcessor = () => {
    const { setProvider } = useAuth();
    const { login, isLoggingIn } = useNfidIdentity();
    // State to track if access has been granted via password
    const [isAccessGranted, setIsAccessGranted] = useState(false);

    const handleLogin = async () => {
        try {
            setProvider('NFID');
            await login();
        } catch (error) {
            toast.error('Authentication failed. Please try again.', {
                description: 'If the problem persists, please check your NFID connection.'
            });
            console.error(error);
        }
    }

    const handleButtonClick = () => {
        if (isAccessGranted) {
            handleLogin();
        } else {
            const password = window.prompt("Enter the password to test NFID login:");
            if (password === PROTECTED_PASSWORD) {
                setIsAccessGranted(true);
                handleLogin();
            } else if (password !== null) {
                toast.error('Invalid password');
            }
        }
    };

    return (
        <Button
            onClick={handleButtonClick}
            variant="outline"
            disabled={isLoggingIn}
            className="w-full h-auto justify-between mb-2 p-4 border border-border dark:hover:border-primary transition-colors group"
            style={!isAccessGranted ? { opacity: 0.6 } : {}}
        >
            <div className="w-full flex items-center gap-3">
                <div className="relative basis-10 flex-grow-0 flex-shrink-0">
                    <img
                        src="/images/nfid-logo.png"
                        alt="NFID"
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
                        <span className="font-medium">
                            NFID {!isAccessGranted && <span className="text-xs text-muted-foreground">(Test Access)</span>}
                        </span>
                        <Mail size={14} className="text-constructive" />
                    </div>
                    <div className="w-full flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            Email-based authentication
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
                            Simple email verification
                        </span>
                    </div>
                </div>
            </div>
        </Button>
    );
}

export default NFIDProcessor;