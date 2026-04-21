import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/lib/components/card";
import { Skeleton } from "@/lib/components/skeleton";

export function ShelfCardSkeleton() {
	return (
		<Card className="flex flex-col">
			<CardHeader className="p-4 pb-2">
				<Skeleton className="h-5 w-full rounded" />
				<div className="space-y-1 mt-1">
					<Skeleton className="h-4 w-full rounded" />
					<Skeleton className="h-4 w-4/5 rounded" />
				</div>
			</CardHeader>
			<CardContent className="px-4 pb-2 pt-0">
				<div className="flex gap-1.5">
					<Skeleton className="h-[22px] w-24 rounded-full" />
					<Skeleton className="h-[22px] w-20 rounded-full" />
				</div>
			</CardContent>
			<CardFooter className="px-4 py-3 mt-auto border-t">
				<div className="flex items-center justify-between w-full">
					<Skeleton className="h-4 w-28 rounded" />
					<div className="flex items-center gap-3">
						<Skeleton className="h-4 w-16 rounded" />
						<Skeleton className="h-3.5 w-3.5 rounded-full" />
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}

export function ShelfGridSkeleton({ count = 8 }: { count?: number }) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
			{Array.from({ length: count }, (_, i) => (
				<ShelfCardSkeleton key={i} />
			))}
		</div>
	);
}
