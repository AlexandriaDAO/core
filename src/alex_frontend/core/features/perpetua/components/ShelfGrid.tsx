import React from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Inbox } from "lucide-react";
import type { Shelf } from "../types";
import ShelfCard from "./ShelfCard";

interface ShelfGridProps {
	shelves: Shelf[];
	basePath?: string;
}

export default function ShelfGrid({ shelves, basePath }: ShelfGridProps) {
	if (shelves.length === 0) {
		return (
			<div className="flex flex-col items-center gap-4 py-24 text-muted-foreground dark:text-gray-400 animate-fade">
				<div className="h-12 w-12 rounded-full bg-muted dark:bg-gray-800 flex items-center justify-center">
					<Inbox className="h-6 w-6" />
				</div>
				<p className="text-base">No shelves found.</p>
			</div>
		);
	}

	return (
		<ResponsiveMasonry columnsCountBreakPoints={{ 0: 1, 640: 2, 1024: 3, 1280: 4 }}>
			<Masonry gutter="1.25rem">
				{shelves.map((shelf, index) => (
					<div
						key={shelf.shelfId}
						className="animate-fade w-full"
						style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
					>
						<ShelfCard shelf={shelf} basePath={basePath} />
					</div>
				))}
			</Masonry>
		</ResponsiveMasonry>
	);
}
