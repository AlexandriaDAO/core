import React from 'react';
import { LucideIcon, File as FileIcon } from 'lucide-react';

interface PreviewProps {
	icon?: LucideIcon;
	message?: string;
	contentType?: string;
}

const Preview: React.FC<PreviewProps> = ({ icon: Icon = FileIcon, message, contentType }) => {
	return (
		<div className="h-44 p-2 flex flex-col items-center justify-center text-muted-foreground gap-2">
			<Icon size={48} strokeWidth={1.25}/>
			{message && <p className="text-sm">{message}</p>}
			{contentType && <p className="text-xs text-muted-foreground/70">{contentType}</p>}
		</div>
	)
};

export default Preview;