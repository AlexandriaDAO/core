import React, { useState } from "react";
import Search from "./Search";
import ContentList from "./ContentList";
import ContentRenderer from "./ContentRenderer";
import { Transaction } from "./types/queries";

export default function Alexandrian() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [selectedContent, setSelectedContent] = useState<string | null>(null);
	const [contentType, setContentType] = useState<string>("application/epub+zip");

	const handleSelectContent = (id: string, type: string) => {
		setSelectedContent(id);
	};

	const handleContentTypeChange = (newContentType: string) => {
		setContentType(newContentType);
		setSelectedContent(null);
	};

	return (
		<div>
			<Search 
				onTransactionsUpdate={setTransactions} 
				onContentTypeChange={handleContentTypeChange}
			/>
			<ContentList 
				transactions={transactions} 
				onSelectContent={handleSelectContent}
				contentType={contentType}
			/>
			{selectedContent && (
				<ContentRenderer contentId={selectedContent} contentType={contentType} />
			)}
		</div>
	);
}
