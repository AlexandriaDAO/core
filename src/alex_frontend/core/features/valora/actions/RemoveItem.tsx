import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/lib/components/tooltip";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/lib/components/alert-dialog";
import { useRemoveItem } from "../hooks/useMutations";

interface RemoveItemProps {
	shelfId: string;
	itemId: number;
}

export default function RemoveItem({ shelfId, itemId }: RemoveItemProps) {
	const removeItem = useRemoveItem();

	const handleRemove = () => {
		removeItem.mutate({ shelfId, itemId });
	};

	return (
		<AlertDialog>
			<Tooltip>
				<TooltipTrigger asChild>
					<AlertDialogTrigger asChild>
						<Button
							variant="ghost"
							scale="sm"
							className="h-8 w-8 p-0 rounded-full bg-background/90 backdrop-blur-sm shadow-sm text-muted-foreground hover:text-destructive"
							disabled={removeItem.isPending}
						>
							{removeItem.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Trash2 className="h-4 w-4" />
							)}
						</Button>
					</AlertDialogTrigger>
				</TooltipTrigger>
				<TooltipContent>Remove item</TooltipContent>
			</Tooltip>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove item?</AlertDialogTitle>
					<AlertDialogDescription>
						This item will be removed from the shelf. This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleRemove}>Remove</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
