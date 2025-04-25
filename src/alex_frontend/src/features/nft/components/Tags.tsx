import React from "react";
import { Label } from "@/lib/components/label";
import Copy from "@/components/Copy";
import { Tags as TagsType } from "../types";
import { Alert } from "@/components/Alert";
import { Loader } from "lucide-react";

interface TagsProps {
    tags: TagsType;
    loading: boolean;
    error: string | null;
};

const Tags: React.FC<TagsProps> = ({ tags, loading, error }) => {
	return (
		<div className="mt-4">
			<div className="flex items-center justify-between mb-2">
				<Label className="text-lg font-medium">Tags</Label>
			</div>

			{loading ? (
				<div className="flex items-center justify-start h-full gap-1">
					<Loader size={16} className="animate-spin text-primary" />
					<span className="text-sm text-gray-500">Loading tags...</span>
				</div>
			) : error ? (
				<Alert variant="danger" title="Error">
					{error}
				</Alert>
			) : tags.length <= 0 ? (
				<Alert variant="default" title="No Tags">
					No tags were found for this transaction
				</Alert>
			) : (
				<div className="space-y-2 max-h-80 overflow-y-auto p-2 border rounded">
					{tags.map((tag, index) => (
						<div
							key={index}
							className="flex items-center justify-between py-1 border-b last:border-b-0"
						>
							<Label className="text-sm text-primary min-w-24">
								{tag.name}
							</Label>
							<div className="flex items-center flex-1 justify-end">
								<span className="text-sm break-all mr-2">
									{tag.value}
								</span>
								<Copy text={tag.value} />
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Tags;
