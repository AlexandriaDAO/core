import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";

interface UploadProgressProps {
    file: File | null;
}

function UploadProgress({ file }: UploadProgressProps) {
    const {progress} = useAppSelector(state=>state.fileUpload)

    if (!file) return null;

	return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium text-gray-700">Uploading {file?.name}</span>
                </div>
                <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-blue-100">
                    <div 
                        style={{ width: `${progress}%` }}
                        className="transition-all duration-300 ease-out shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                </div>
            </div>
        </div>
    )
}

export default UploadProgress;
