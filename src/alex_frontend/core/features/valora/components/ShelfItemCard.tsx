import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card } from "@/lib/components/card";
import { FolderOpen, Loader2, ChevronRight } from "lucide-react";
import { useShelf } from "../hooks/useShelf";

interface ShelfItemCardProps {
	shelfId: string;
	listView?: boolean;
}

export default function ShelfItemCard({ shelfId, listView }: ShelfItemCardProps) {
	const navigate = useNavigate();
	const { data: shelf, isLoading } = useShelf(shelfId);

	const handleClick = () => {
		navigate({ to: "/app/valora/shelf/$shelfId", params: { shelfId } });
	};

	if (isLoading) {
		return (
			<Card className="min-h-40 flex items-center justify-center bg-muted/30 dark:bg-gray-800/50">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground dark:text-gray-400" />
			</Card>
		);
	}

	if (listView) {
		return (
			<Card
				onClick={handleClick}
				className="flex items-center gap-4 p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-muted/10 dark:bg-gray-800/30"
			>
				<div className="h-10 w-10 rounded-full bg-muted dark:bg-gray-700 flex items-center justify-center shrink-0">
					<FolderOpen className="h-5 w-5 text-muted-foreground dark:text-gray-300" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-semibold font-syne truncate">
						{shelf?.title ?? "Unknown shelf"}
					</p>
					{shelf && (
						<p className="text-sm text-muted-foreground dark:text-gray-400">
							{shelf.items.length} item{shelf.items.length !== 1 ? "s" : ""}
						</p>
					)}
				</div>
				<ChevronRight className="h-4 w-4 text-muted-foreground dark:text-gray-400 shrink-0" />
			</Card>
		);
	}

	return (
		<Card
			onClick={handleClick}
			className="min-h-40 flex flex-col items-center justify-center gap-3 p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-muted/10 dark:bg-gray-800/30"
		>
			<div className="h-12 w-12 rounded-full bg-muted dark:bg-gray-700 flex items-center justify-center">
				<FolderOpen className="h-6 w-6 text-muted-foreground dark:text-gray-300" />
			</div>
			<div className="text-center">
				<p className="text-sm font-semibold font-syne truncate max-w-full">
					{shelf?.title ?? "Unknown shelf"}
				</p>
				{shelf && (
					<p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
						{shelf.items.length} item{shelf.items.length !== 1 ? "s" : ""}
					</p>
				)}
			</div>
		</Card>
	);
}
