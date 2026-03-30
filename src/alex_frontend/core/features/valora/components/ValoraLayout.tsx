import React, { useState } from "react";
import { useMatch } from "@tanstack/react-router";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Separator } from "@/lib/components/separator";
import FeedSwitcher from "./FeedSwitcher";
import ActionBar from "./ActionBar";
import FeedView from "./FeedView";
import FilteredShelfList from "./FilteredShelfList";
import TagBar from "./TagBar";
import FollowSection from "./FollowSection";
import UserShelvesView from "./UserShelvesView";
import ShelfDetail from "./ShelfDetail";
import CreateShelf from "../actions/CreateShelf";

export default function ValoraLayout() {
	const [showNewShelf, setShowNewShelf] = useState(false);
	const showFilters = useAppSelector((state) => state.valora.showFilters);
	const showFollowing = useAppSelector((state) => state.valora.showFollowing);
	const tagFilter = useAppSelector((state) => state.valora.tagFilter);

	// Route matching — determine current view
	const shelfMatch = useMatch({ from: "/_auth/app/valora/shelf/$shelfId", shouldThrow: false });
	const userMatch = useMatch({ from: "/_auth/app/valora/user/$userId/", shouldThrow: false });
	const userShelfMatch = useMatch({ from: "/_auth/app/valora/user/$userId/shelf/$shelfId", shouldThrow: false });

	const shelfId = shelfMatch?.params.shelfId ?? userShelfMatch?.params.shelfId;
	const userId = userMatch?.params.userId ?? userShelfMatch?.params.userId;

	// Shelf detail view
	if (shelfId) {
		return <ShelfDetail shelfId={shelfId} userId={userId} />;
	}

	// User shelves view
	if (userId) {
		return (
			<div className="flex flex-col gap-6 px-4 py-6 max-w-6xl w-full mx-auto">
				<UserShelvesView userId={userId} />
			</div>
		);
	}

	// Default: feed view
	return (
		<div className="flex flex-col gap-6 px-4 py-6 max-w-6xl w-full mx-auto">
			<div className="flex items-center justify-between">
				<FeedSwitcher />
				<ActionBar onNewShelf={() => setShowNewShelf(true)} />
			</div>

			{(showFilters || showFollowing) && (
				<div className="flex flex-col gap-4">
					{showFilters && (
						<div className="border-b pb-4">
							<TagBar />
						</div>
					)}
					{showFollowing && (
						<div className="border-b pb-4">
							<FollowSection />
						</div>
					)}
				</div>
			)}

			{tagFilter ? <FilteredShelfList /> : <FeedView />}

			<CreateShelf open={showNewShelf} onOpenChange={setShowNewShelf} />
		</div>
	);
}
