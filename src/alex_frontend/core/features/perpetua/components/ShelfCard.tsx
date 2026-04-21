import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardHeader, CardContent, CardFooter } from "@/lib/components/card";
import { Badge } from "@/lib/components/badge";
import { Globe, Layers, Lock, Tag } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useUsername } from "@/hooks/useUsername";
import { setTagFilter } from "../store/slice";
import type { Shelf } from "../types";
import { shortenPrincipal } from "../utils";
import FollowUser from "../actions/FollowUser";
import FollowTag from "../actions/FollowTag";
import AddToShelf from "../actions/AddToShelf";

interface ShelfCardProps {
	shelf: Shelf;
	basePath?: string;
}

export default function ShelfCard({ shelf, basePath }: ShelfCardProps) {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { username } = useUsername(shelf.owner);
	const itemCount = shelf.items.length;

	const handleClick = () => {
		if (basePath) {
			navigate({ to: basePath + "/shelf/$shelfId", params: { shelfId: shelf.shelfId } } as any);
		} else {
			navigate({ to: "/app/perpetua/shelf/$shelfId", params: { shelfId: shelf.shelfId } });
		}
	};

	const handleOwnerClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigate({ to: "/app/perpetua/user/$userId", params: { userId: shelf.owner } });
	};

	const handleTagClick = (e: React.MouseEvent, tag: string) => {
		e.stopPropagation();
		dispatch(setTagFilter(tag));
	};

	return (
		<Card
			onClick={handleClick}
			className="relative cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col dark:bg-gray-900 dark:border-gray-700/70"
		>
			<div className="absolute right-2 top-0 z-10" onClick={(e) => e.stopPropagation()}>
				<AddToShelf shelfId={shelf.shelfId} />
			</div>
			<CardHeader className="p-2">
				<div className="flex items-center gap-1.5">
					{shelf.publicEditing ? (
						<Globe className="h-4 w-4 text-green-500 shrink-0" />
					) : (
						<Lock className="h-4 w-4 text-amber-500 shrink-0" />
					)}
					<h3 className="font-semibold text-base font-syne truncate">{shelf.title}</h3>
				</div>
				{shelf.description && (
					<p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-2">{shelf.description}</p>
				)}
			</CardHeader>

			{shelf.tags.length > 0 && (
				<CardContent className="px-2 pb-2 pt-0">
					<div className="flex gap-1.5 flex-wrap">
						{shelf.tags.map((tag) => (
							<div key={tag} className="flex items-stretch">
								<Badge
									variant="outline"
									className="text-xs py-0.5 px-2.5 cursor-pointer rounded-r-none border-r-0 bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
									onClick={(e) => handleTagClick(e, tag)}
								>
									<Tag className="h-3 w-3 mr-1" />
									{tag}
								</Badge>
								<FollowTag tag={tag} />
							</div>
						))}
					</div>
				</CardContent>
			)}

			<CardFooter className="p-2 mt-auto border-t">
				<div className="flex items-center justify-between w-full text-sm text-muted-foreground dark:text-gray-400">
					<div className="flex items-center gap-1 min-w-0">
						<FollowUser userId={shelf.owner} />
						<button
							onClick={handleOwnerClick}
							className="hover:underline hover:text-foreground transition-colors truncate max-w-[140px] font-roboto-condensed"
						>
							{username || shortenPrincipal(shelf.owner)}
						</button>
					</div>

					<div className="flex items-center gap-1 text-xs text-muted-foreground font-medium font-roboto-condensed">
						<Layers className="h-3 w-3" />
						<span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}
