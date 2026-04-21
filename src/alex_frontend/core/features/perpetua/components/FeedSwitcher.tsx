import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setFeedType } from "../store/slice";
import type { FeedType } from "../types";

export default function FeedSwitcher() {
	const dispatch = useAppDispatch();
	const feedType = useAppSelector((state) => state.perpetua.feedType);
	const user = useAppSelector((state) => state.auth.user);

	const handleChange = (value: string) => {
		if (value) dispatch(setFeedType(value as FeedType));
	};

	return (
		<Tabs value={feedType} onValueChange={handleChange}>
			<TabsList className="dark:bg-gray-800">
				<TabsTrigger value="recency" className="dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100 dark:text-gray-400">Recent</TabsTrigger>
				<TabsTrigger value="random" className="dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100 dark:text-gray-400">Discover</TabsTrigger>
				{user && <TabsTrigger value="storyline" className="dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100 dark:text-gray-400">Storyline</TabsTrigger>}
			</TabsList>
		</Tabs>
	);
}
