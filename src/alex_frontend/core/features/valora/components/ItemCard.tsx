import React, { useState } from "react";
import { Card } from "@/lib/components/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/lib/components/dialog";
import { FileText } from "lucide-react";
import type { Item } from "../types";
import NftItemCard from "./NftItemCard";
import ShelfItemCard from "./ShelfItemCard";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface ItemCardProps {
	item: Item;
	listView?: boolean;
}

export default function ItemCard({ item, listView }: ItemCardProps) {
	const { content } = item;

	if ("Nft" in content) {
		return <NftItemCard tokenId={content.Nft} listView={listView} />;
	}

	if ("Markdown" in content) {
		return <MarkdownItemCard markdown={content.Markdown} listView={listView} />;
	}

	if ("Shelf" in content) {
		return <ShelfItemCard shelfId={content.Shelf} listView={listView} />;
	}

	return null;
}

function MarkdownItemCard({ markdown, listView }: { markdown: string; listView?: boolean }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Card
				className={`overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
					listView ? "max-h-48" : "max-h-72"
				}`}
				onClick={() => setOpen(true)}
			>
				<MarkdownRenderer
					content={markdown}
					className="shadow-none text-sm pointer-events-none"
				/>
			</Card>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Markdown Content
						</DialogTitle>
						<DialogDescription className="sr-only">
							Full markdown content view
						</DialogDescription>
					</DialogHeader>
					<div className="py-2">
						<MarkdownRenderer
							content={markdown}
							className="shadow-none"
						/>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
