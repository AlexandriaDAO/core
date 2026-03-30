import React, { useCallback, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/lib/components/tooltip";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useUserShelves } from "../hooks/useShelves";
import { useReorderProfileShelf } from "../hooks/useMutations";
import { useReorder } from "../hooks/useReorder";
import ShelfGrid from "./ShelfGrid";
import { ShelfGridSkeleton } from "./ShelfSkeleton";
import FollowUser from "../actions/FollowUser";
import { useUsername } from "@/hooks/useUsername";
import { shortenPrincipal } from "../utils";
import type { Shelf } from "../types";

function SortableShelfRow({ shelf }: { shelf: Shelf }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: shelf.shelfId });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 10 : undefined,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-shadow ${
				isDragging ? "shadow-lg ring-2 ring-primary/30 opacity-90" : "hover:shadow-sm"
			}`}
		>
			<button
				{...attributes}
				{...listeners}
				className="shrink-0 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted dark:hover:bg-gray-800 transition-colors touch-none"
			>
				<GripVertical className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
			</button>
			<span className="text-sm font-medium truncate flex-1">{shelf.title}</span>
			<span className="text-xs text-muted-foreground dark:text-gray-500 shrink-0">
				{shelf.items.length} item{shelf.items.length !== 1 ? "s" : ""}
			</span>
		</div>
	);
}

interface UserShelvesViewProps {
	userId: string;
}

export default function UserShelvesView({ userId }: UserShelvesViewProps) {
	const navigate = useNavigate();
	const user = useAppSelector((state) => state.auth.user);
	const isOwnProfile = user?.principal === userId;
	const { username } = useUsername(isOwnProfile ? null : userId);
	const { data: shelves, isLoading } = useUserShelves(userId);
	const reorderShelf = useReorderProfileShelf();

	const handleSaveOrder = useCallback(async (reordered: Shelf[]) => {
		for (let i = 0; i < reordered.length; i++) {
			const shelf = reordered[i];
			const referenceShelfId = i > 0 ? reordered[i - 1].shelfId : undefined;
			await reorderShelf.mutateAsync({
				shelfId: shelf.shelfId,
				referenceShelfId,
				before: false,
			});
		}
	}, [reorderShelf]);

	const getId = useCallback((shelf: Shelf) => shelf.shelfId, []);

	const reorder = useReorder({
		items: shelves ?? [],
		getId,
		onSave: handleSaveOrder,
	});

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor),
	);

	const sortableIds = useMemo(
		() => reorder.displayItems.map((s) => s.shelfId),
		[reorder.displayItems],
	);

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							scale="sm"
							onClick={() => navigate({ to: "/app/valora" })}
							className="h-9 w-9 p-0"
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Back to feed</TooltipContent>
				</Tooltip>
				<div className="flex items-center gap-3 flex-1">
					<h2 className="text-2xl font-bold font-syne">
						{isOwnProfile ? "My Library" : username ? `@${username}` : shortenPrincipal(userId)}
					</h2>
					{!isLoading && (
						<span className="text-sm text-muted-foreground dark:text-gray-400">
							{shelves?.length ?? 0} shelves
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					{!isOwnProfile && <FollowUser userId={userId} variant="full" />}
					{isOwnProfile && !isLoading && (shelves?.length ?? 0) > 1 && (
						<>
							{!reorder.isEditMode ? (
								<Button variant="secondary" scale="sm" onClick={reorder.enterEditMode}>
									<GripVertical className="h-4 w-4 mr-1" />
									Reorder
								</Button>
							) : (
								<>
									<Button variant="primary" scale="sm" onClick={reorder.save} disabled={reorder.isSaving}>
										{reorder.isSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
										Save
									</Button>
									<Button variant="secondary" scale="sm" onClick={reorder.cancelEditMode} disabled={reorder.isSaving}>
										Cancel
									</Button>
								</>
							)}
						</>
					)}
				</div>
			</div>

			{/* Shelves */}
			{isLoading ? (
				<ShelfGridSkeleton />
			) : reorder.isEditMode ? (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={reorder.onDragEnd}
				>
					<SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
						<div className="flex flex-col gap-2">
							{reorder.displayItems.map((shelf) => (
								<SortableShelfRow key={shelf.shelfId} shelf={shelf} />
							))}
						</div>
					</SortableContext>
				</DndContext>
			) : (
				<ShelfGrid
					shelves={shelves ?? []}
					basePath={`/app/valora/user/${userId}`}
				/>
			)}
		</div>
	);
}
