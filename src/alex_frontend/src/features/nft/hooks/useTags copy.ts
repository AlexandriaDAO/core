import { useState, useEffect } from "react";
import { Tag, Tags, TransactionStatus } from "../types";
import { getFileTypeInfo } from "@/features/pinax/constants";

const useTags = ( id: string, status: TransactionStatus) => {
	const [tags, setTags] = useState<Tags>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!status || typeof status !== 'object') return;

		const fetchTags = async () => {
			try {
				setLoading(true);
				const response = await fetch('https://arweave.net/tx/' + id + '/tags');
				if(!response.ok){
					throw new Error("Failed to fetch Transaction tags");
				}
				const data = await response.json();

				const tags: Tags = data.tags.map((tag: Tag) => ({
					name: atob(tag.name),
					value: atob(tag.value)
				}));

				setTags(tags);
			} catch (err) {
				console.error("Error fetching Transaction data:", err);
				setError( err instanceof Error ? err.message : "Failed to load Transaction data");
			} finally {
				setLoading(false);
			}
		};

		fetchTags();
	}, [status]);


	const contentType = tags.find(tag => tag.name.toLowerCase() === "content-type")?.value || "application/octet-stream";

	const assetType = getFileTypeInfo(contentType)?.label;


	return { tags, loading, error, contentType, assetType };
};

export default useTags;
