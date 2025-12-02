import React from "react";
import { Label } from "@/lib/components/label";
import { Tags as TagsType } from "../../types";
import { copyToClipboard } from "@/utils/general";

interface TagProps {
    tags?: TagsType;
}

const Tags: React.FC<TagProps> = ({ tags = [] }) => {
    if (tags.length <= 0) return <></>;

	const scrollClasses = "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400";

	return (
        <div className={`space-y-2 p-2 border rounded ${scrollClasses}`}>
            {tags.map((tag, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between flex-wrap py-1 border-b last:border-b-0"
                >
                    <Label className="text-sm text-primary pr-2 cursor-copy" onClick={()=>copyToClipboard(tag.name)}>
                        {tag.name}
                    </Label>
                    <span className="text-sm break-all cursor-copy" onClick={()=>copyToClipboard(tag.value)}>
                        {tag.value}
                    </span>
                </div>
            ))}
        </div>
	);
};

export default Tags;
