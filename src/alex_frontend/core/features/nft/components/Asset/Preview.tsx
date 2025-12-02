import React from 'react';
import { cn } from "@/lib/utils";
import { File } from 'lucide-react';

interface PreviewProps {
	icon?: React.ReactNode;
	title?: string;
	description?: string;
	className?: string;
}

const Preview: React.FC<PreviewProps> = ({ icon = <File size={48} strokeWidth={1.25}/>, title, description, className }) => {
	return (
		<div className={cn("min-h-40 h-full w-full place-items-center place-content-center text-muted-foreground space-y-2 p-2", className)}>
			{icon}
			{title && <p className="text-sm break-all">{title}</p>}
			{description && <p className="break-all text-xs text-muted-foreground/70">{description}</p>}
		</div>
	)
};

export default Preview;