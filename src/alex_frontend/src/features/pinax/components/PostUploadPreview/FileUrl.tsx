import React from "react";
import { ExternalLink } from "lucide-react";
import Copy from "@/components/Copy";

interface FileUrlProps {
	transaction: string;
}

const FileUrl: React.FC<FileUrlProps> = ({transaction}) => {

	const fileUrl = 'https://arweave.net/'+transaction;

	return (
        <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
                File URL:
            </span>
            <div className="flex items-center space-x-2">
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary/80 hover:text-primary flex items-center"
                >
                    View file
                    <ExternalLink
                        className="w-4 h-4 ml-1"
                        strokeWidth={2}
                    />
                </a>
                <Copy text={fileUrl} />
            </div>
        </div>
	);
};

export default FileUrl;
