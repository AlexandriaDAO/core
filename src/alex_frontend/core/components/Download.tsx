import React, { useState, useRef, useEffect } from "react";
import { Download as DownloadIcon, Check, AlertCircle, ArrowDown } from "lucide-react";
import { wait } from "@/utils/lazyLoad";
import { toast } from "sonner";

interface DownloadProps {
	url: string;
    name?: string;
	size?: "sm" | "base" | "lg";
}

const Download: React.FC<DownloadProps> = ({ url, name="file", size = "base" }) => {
    const [success, setSuccess] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

	const handleDownload = async () => {
        if (downloading || success) return;

        // Create new AbortController for this download
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setDownloading(true);
        setError(false);
        try {
            // Fetch the file to create a proper download
            const response = await fetch(url, { signal: abortController.signal });
            if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the blob URL
            URL.revokeObjectURL(blobUrl);

            // Stop downloading first, then show success
            setDownloading(false);
            setSuccess(true);
            toast.success("File downloaded successfully!");
            await wait(2000);
            setSuccess(false);
        } catch (err) {
            // Don't show error if it was aborted (component unmounted)
            if (err instanceof Error && err.name === 'AbortError') {
                console.log('Download cancelled');
                return;
            }
            console.error('Download failed:', err);
            setDownloading(false);
            setError(true);
            toast.error("Download failed. Please try again.");
            await wait(2000);
            setError(false);
        } finally {
            abortControllerRef.current = null;
        }
	};

    // Cleanup on unmount - cancel any ongoing download
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

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
            disabled={downloading || success || error}
            onClick={handleDownload}
            className={`${sizeClasses[size].button} ${(downloading || error) ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Download"
        >
            {downloading ? (
                <ArrowDown
                    className={`${sizeClasses[size].icon} text-muted-foreground animate-bounce`}
                    strokeWidth={2}
                />
            ) : success ? (
                <Check
                    className={`${sizeClasses[size].icon} text-green-600`}
                    strokeWidth={2}
                />
            ) : error ? (
                <AlertCircle
                    className={`${sizeClasses[size].icon} text-red-600`}
                    strokeWidth={2}
                />
            ) : (
                <DownloadIcon
                    xlinkTitle="Download"
                    strokeWidth={2}
                    className={`${sizeClasses[size].icon} text-muted-foreground hover:text-muted-foreground/50`}
                />
            )}
        </button>
	);
};

export default Download;