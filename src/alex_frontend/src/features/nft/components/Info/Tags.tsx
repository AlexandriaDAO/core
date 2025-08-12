import React from "react";
import { Label } from "@/lib/components/label";
import Copy from "@/components/Copy";
import { Tags as TagsType } from "../../types";

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
                    className="flex items-center justify-between py-1 border-b last:border-b-0"
                >
                    <Label className="text-sm text-primary min-w-24">
                        {tag.name}
                    </Label>
                    <div className="flex items-center flex-1 justify-end">
                        <span className="text-sm break-all mr-2">
                            {tag.value}
                        </span>
                        <Copy text={tag.value} size="sm"/>
                    </div>
                </div>
            ))}
        </div>
	);
};

export default Tags;
