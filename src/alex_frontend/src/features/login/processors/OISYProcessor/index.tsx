import React, { useState } from "react";
import { LoaderCircle, X, Wallet, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/lib/components/button";
import useAuth from "@/hooks/useAuth";
import { useSiwoIdentity } from "ic-use-siwo-identity";
import { toast } from "sonner";

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
                handleLogin();
            } else if (password !== null) {
                toast.error('Invalid password');
            }
        }
    };


	return (
		<Dialog open={isOpen}>
			<DialogTrigger asChild>
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
								src="/images/oisy-logo.svg"
								alt="OISY"
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
									OISY {!isAccessGranted && <span className="text-xs text-muted-foreground">(Test Access)</span>}
								</span>
								<Wallet size={14} className="text-constructive" />
							</div>
							<div className="w-full flex items-center justify-between">
								<span className="text-xs text-muted-foreground">
									Web3 wallet authentication
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
									Secure wallet connection
								</span>
							</div>
						</div>
					</div>
				</Button>
			</DialogTrigger>

			<DialogContent
				closeIcon={<X size={20} onClick={() => setIsOpen(false)} />}
				onOpenAutoFocus={(e) => e.preventDefault()}
				className="sm:max-w-[400px] bg-background border-border"
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Wallet size={20} className="text-constructive" />
						OISY Wallet
					</DialogTitle>
					<DialogDescription>
						Connect your OISY wallet to continue
					</DialogDescription>
				</DialogHeader>
				<Model />
			</DialogContent>
		</Dialog>
	);
};

export default OISYProcessor;
