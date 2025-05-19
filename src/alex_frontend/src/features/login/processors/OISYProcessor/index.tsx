import React, { useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { Button } from "@/lib/components/button";
import useAuth from "@/hooks/useAuth";
import { useSiwoIdentity } from "ic-use-siwo-identity";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/lib/components/dialog";

import Model from "./Model";

// Define a password for protected access during testing
const PROTECTED_PASSWORD = "testoisy"; // Change this as needed


const OISYProcessor = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	// const { setProvider } = useAuth();
	const { isLoggingIn } = useSiwoIdentity();
    // State to track if access has been granted via password
    const [isAccessGranted, setIsAccessGranted] = useState(false);

	const handleLogin = async () => {
		// setProvider("OISY");
		setIsOpen(true);
	};

    const handleButtonClick = () => {
        if (isAccessGranted) {
            handleLogin();
        } else {
            const password = window.prompt("Enter the password to test OISY login:");
            if (password === PROTECTED_PASSWORD) {
                setIsAccessGranted(true);

                handleLogin(); // Proceed with login immediately after correct password
            } else if (password !== null) { // Check if prompt was cancelled
                alert("Incorrect password.");
            }
        }
    };


	return (
		<Dialog open={isOpen}>
			<DialogTrigger asChild>
				<Button
					onClick={handleButtonClick}
					variant="link"
					disabled={isLoggingIn}
					className="w-full justify-between mb-2 py-6 text-left"
                    style={!isAccessGranted ? { opacity: 0.6, pointerEvents: isLoggingIn ? 'none' : 'auto' } : {}}
                    title={!isAccessGranted ? "OISY Login (Test Access)" : "Login with OISY"}
				>
					<div className="flex flex-col">
						<span className="font-medium">OISY</span>
						<span className="text-xs opacity-80">
							Oisy wallet authentication
						</span>
					</div>
					{isLoggingIn ? (
						<LoaderCircle className="animate-spin" />
					) : (
						<img
							src="/images/oisy-logo.svg"
							alt="OISY"
							className="w-8 h-8"
						/>
					)}
				</Button>
			</DialogTrigger>

			<DialogContent
				closeIcon={<X size={20} onClick={() => setIsOpen(false)} />}
				onOpenAutoFocus={(e) => e.preventDefault()}
				className={`sm:max-w-[400px] bg-white dark:bg-gray-900 border dark:border-gray-800`}
			>
				<DialogHeader>
					<DialogTitle>OISY</DialogTitle>
					<DialogDescription>
						Sign in with Your OISY wallet
					</DialogDescription>
				</DialogHeader>
				<Model />
			</DialogContent>
		</Dialog>
	);
};

export default OISYProcessor;
