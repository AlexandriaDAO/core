import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { LoaderCircle } from "lucide-react";
import { formatFileSize } from "../utils";

interface UploadProgressProps {
    file: File | null;
}

function UploadProgress({ file }: UploadProgressProps) {
    const { progress, fetching, selecting, uploading } = useAppSelector(state => state.arinax);

    if (!file) return null;

    let statusText = "Preparing...";
    if (fetching) statusText = "Fetching wallets...";
    if (selecting) statusText = "Selecting suitable wallet...";
    if (uploading) statusText = "Uploading file...";

    return (
        <div className="font-roboto-condensed bg-secondary rounded shadow-sm p-8 border">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <LoaderCircle className="animate animate-spin"/>
                        <div>
                            <span className="font-medium text-gray-700 dark:text-white">
                                {statusText}
                            </span>
                            {uploading && (
                                <div className="text-sm text-gray-500">
                                    {formatFileSize((file.size * progress) / 100)} of {formatFileSize(file.size)}
                                </div>
                            )}
                        </div>
                    </div>
                    {uploading && <span className="text-sm">{progress}%</span>}
                </div>
                {uploading && (
                    <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-blue-100">
                            <div
                                style={{ width: `${progress}%` }}
                                className={`transition-all duration-300 ease-out shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-constructive`}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UploadProgress;
