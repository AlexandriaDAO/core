import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Library, Plus, Users, Filter, FilterX } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/lib/components/tooltip";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { toggleFilters, toggleFollowing } from "../store/slice";

interface ActionBarProps {
	onNewShelf: () => void;
}

export default function ActionBar({ onNewShelf }: ActionBarProps) {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const user = useAppSelector((state) => state.auth.user);
	const showFilters = useAppSelector((state) => state.valora.showFilters);
	const showFollowing = useAppSelector((state) => state.valora.showFollowing);

	return (
		<div className="flex items-center gap-1">
			{user && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={onNewShelf}
							variant="ghost"
							scale="sm"
							className="h-9 w-9 p-0"
						>
							<Plus className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>New Shelf</TooltipContent>
				</Tooltip>
			)}

			{user && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={() => navigate({ to: "/app/valora/user/$userId", params: { userId: user.principal } })}
							variant="ghost"
							scale="sm"
							className="h-9 w-9 p-0"
						>
							<Library className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>My Library</TooltipContent>
				</Tooltip>
			)}

			{user && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={() => dispatch(toggleFollowing())}
							variant={showFollowing ? "secondary" : "ghost"}
							scale="sm"
							className="h-9 w-9 p-0"
						>
							<Users className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Following</TooltipContent>
				</Tooltip>
			)}

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						onClick={() => dispatch(toggleFilters())}
						variant={showFilters ? "secondary" : "ghost"}
						scale="sm"
						className="h-9 w-9 p-0"
					>
						{showFilters ? <FilterX className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
					</Button>
				</TooltipTrigger>
				<TooltipContent>{showFilters ? "Hide Filters" : "Show Filters"}</TooltipContent>
			</Tooltip>
		</div>
	);
}
