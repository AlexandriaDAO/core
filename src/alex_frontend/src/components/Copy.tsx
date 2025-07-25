import React, { useState } from "react";
import { Copy as CopyIcon, Check } from "lucide-react";
import { copyToClipboard } from "@/features/pinax/utils";
import { wait } from "@/utils/lazyLoad";

interface CopyProps {
	text: string;
	size?: "sm" | "base" | "lg";
}

const Copy: React.FC<CopyProps> = ({ text, size = "base" }) => {
    const [success, setSuccess] = useState(false);

    const handleCopy = async () => {
        await copyToClipboard(text);
        setSuccess(true);
        await wait(2000);
        setSuccess(false);
    }

    const sizeClasses = {
        sm: {
            button: "p-0.5 rounded-full transition-colors",
            icon: "w-4 h-4"
        },
        base: {
            button: "p-1 rounded-full transition-colors",
            icon: "w-5 h-5"
        },
        lg: {
            button: "p-1.5 rounded-full transition-colors",
            icon: "w-6 h-6"
        }
    };

    return (
        <button
            disabled={success}
            onClick={handleCopy}
            className={sizeClasses[size].button}
            title="Copy"
        >
            {success ? (
                <Check
                    className={`${sizeClasses[size].icon} text-constructive`}
                    strokeWidth={2}
                />
            ) : (
                <CopyIcon
                    className={`${sizeClasses[size].icon} text-muted-foreground hover:text-muted-foreground/50`}
                    strokeWidth={2}
                />
            )}
        </button>
	);
};

export default Copy;
