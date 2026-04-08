import React from "react";
import { Globe, Lock, Loader2 } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/lib/components/tooltip";
import { useTogglePublicAccess } from "../hooks/useMutations";

interface TogglePublicAccessProps {
	shelfId: string;
	isPublic: boolean;
}

export default function TogglePublicAccess({ shelfId, isPublic }: TogglePublicAccessProps) {
	const toggle = useTogglePublicAccess();

	const handleClick = () => {
		toggle.mutate({ shelfId, publicEditing: !isPublic });
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					scale="sm"
					onClick={handleClick}
					disabled={toggle.isPending}
					className="h-9 px-2 text-sm text-muted-foreground dark:text-gray-400"
				>
					{toggle.isPending ? (
						<Loader2 className="h-4 w-4 animate-spin mr-1" />
					) : isPublic ? (
						<Globe className="h-4 w-4 text-green-500 mr-1" />
					) : (
						<Lock className="h-4 w-4 text-amber-500 mr-1" />
					)}
					{isPublic ? "Public" : "Private"}
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				{isPublic ? "Public editing enabled — click to make private" : "Private — click to enable public editing"}
			</TooltipContent>
		</Tooltip>
	);
}
