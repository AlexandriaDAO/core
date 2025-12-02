import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/lib/components/toggle-group";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setCollectionType } from "../../alexandrianSlice";

interface CollectionTypeToggleProps {
	disabled?: boolean;
}

export function CollectionTypeToggle({ disabled }: CollectionTypeToggleProps) {
	const dispatch = useAppDispatch();
	const { collectionType } = useAppSelector((state) => state.alexandrian);

	const handleToggle = (value: string) => {
		if (value === "NFT" || value === "SBT") {
			dispatch(setCollectionType(value));
		}
	};

	return (
		<ToggleGroup
			type="single"
			disabled={disabled}
			value={collectionType}
			onValueChange={handleToggle}
			className="flex gap-1"
		>
			<ToggleGroupItem
				value="NFT"
				variant="outline"
				className="h-10"
			>
				NFTs
			</ToggleGroupItem>
			<ToggleGroupItem
				value="SBT"
				variant="outline"
				className="h-10"
			>
				SBTs
			</ToggleGroupItem>
		</ToggleGroup>
	);
}