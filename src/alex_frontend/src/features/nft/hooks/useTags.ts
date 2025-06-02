import { useState, useEffect } from "react";
import { Tag, Tags, TransactionStatusType } from "../types";
import { getFileTypeInfo } from "@/features/pinax/constants";

const useTags = ( id: string, status: TransactionStatusType ) => {
	const [tags, setTags] = useState<Tags>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id || status === null) return;

		const fetchTags = async () => {
			try {
				setLoading(true);
				const response = await fetch('https://arweave.net/tx/' + id + '/tags');

				if(!response.ok){
					throw new Error("Failed to fetch Transaction tags");
				}

				const text = await response.text();
				if(text.toLowerCase().startsWith("pending")){
					throw new Error("Transaction is pending");
				}
				if(text.toLowerCase().startsWith("not found")){
					throw new Error("Transaction not found");
				}

				const data = JSON.parse(text);

				const tags: Tags = data.map((tag: Tag) => ({
					name: atob(tag.name),
					value: atob(tag.value)
				}));

				setTags(tags);
			} catch (err) {
				console.error("Error fetching tags:", err);
				setError( err instanceof Error ? err.message : "Failed to load tags");
			} finally {
				setLoading(false);
			}
		};

		fetchTags();
	}, [id, status]);

	const contentType = tags.find(tag => tag.name.toLowerCase() === "content-type")?.value || '';

	const assetType = contentType ? getFileTypeInfo(contentType)?.label : undefined;

	return { tags, loading, error, contentType, assetType };
};

export default useTags;
