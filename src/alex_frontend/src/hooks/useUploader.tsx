import { useContext } from "react";
import UploadContext from "@/contexts/UploadContext";

export const useUploader = () => {
    const context = useContext(UploadContext);
    if (context === undefined) {
        throw new Error('useUploader must be used within a UploadProvider');
    }
    return context;
};