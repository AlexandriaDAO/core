import React, { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/lib/components/button";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { useIdentity } from "@/hooks/useIdentity";

// Define a password for protected access during testing
const PROTECTED_PASSWORD = "testnfid"; // Change this as needed

const NFIDProcessor = () => {
    const { setProvider } = useAuth();
    const { login, isLoggingIn } = useIdentity();
    // State to track if access has been granted via password
    const [isAccessGranted, setIsAccessGranted] = useState(false);

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

    const handleButtonClick = () => {
        if (isAccessGranted) {
            handleLogin();
        } else {
            const password = window.prompt("Enter the password to test NFID login:");
            if (password === PROTECTED_PASSWORD) {
                setIsAccessGranted(true);
                // Optionally, you could store this grant in localStorage/sessionStorage
                // localStorage.setItem('nfidAccessGranted', 'true');
                handleLogin(); // Proceed with login immediately after correct password
            } else if (password !== null) { // Check if prompt was cancelled
                alert("Incorrect password.");
            }
        }
    };

    return (
        <>
           <Button
                onClick={handleButtonClick}
                variant="link"
                disabled={isLoggingIn}
                className="w-full justify-between py-6 text-left"
                style={!isAccessGranted ? { opacity: 0.6, pointerEvents: isLoggingIn ? 'none' : 'auto' } : {}}
                title={!isAccessGranted ? "NFID Login (Test Access)" : "Login with NFID"}
            >
                <div className="flex flex-col">
                    <span className="font-medium">
                        NFID {!isAccessGranted && <span className="text-xs">(Test Access)</span>}
                    </span>
                    <span className="text-xs opacity-80">Login with your Email</span>
                </div>
                { isLoggingIn ? <LoaderCircle className="animate-spin" /> : <img src="/images/nfid-logo.png" alt="NFID" className="w-8 h-8" /> }
            </Button>
        </>
    );
}

export default NFIDProcessor;