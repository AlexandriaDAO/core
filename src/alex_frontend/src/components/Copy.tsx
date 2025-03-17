import React, { useState } from "react";
import { Copy as CopyIcon, Check } from "lucide-react";
import { copyToClipboard } from "@/features/upload/utils";
import { wait } from "@/utils/lazyLoad";

interface CopyProps {
	text: string;
}

const Copy: React.FC<CopyProps> = ({ text }) => {
    const [success, setSuccess] = useState(false);

    const handleCopy = async () => {
        await copyToClipboard(text);
        setSuccess(true);
        await wait(2000);
        setSuccess(false);
    }

    return (
        <button
            disabled={success}
            onClick={handleCopy}
            className="p-1 rounded-full transition-colors"
            title="Copy"
        >
            {success ? (
                <Check
                    className="w-5 h-5 text-constructive"
                    strokeWidth={2}
                />
            ) : (
                <CopyIcon
                    className="w-5 h-5 text-muted-foreground hover:text-muted-foreground/50"
                    strokeWidth={2}
                />
            )}
        </button>
	);
};

export default Copy;
