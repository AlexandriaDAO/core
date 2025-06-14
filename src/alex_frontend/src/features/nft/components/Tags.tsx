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

    if(loading) return (
        <Alert variant="default" title="Please Wait" icon={Loader}>
            <span className="text-sm text-gray-500">Loading Transaction Tags...</span>
        </Alert>
    )

    if(error) return (
        <Alert variant="danger" title="Tags Error">
            {error}
        </Alert>
    )

    if(tags.length <= 0) return (
        <Alert variant="default" title="No Tags">
            No tags were found for this transaction
        </Alert>
    )

	return (
		<div className="mt-4">
            <div className="flex items-center justify-between mb-2">
                <Label className="text-lg font-medium">Transaction Tags</Label>
            </div>
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
		</div>
	);
};

export default Tags;
