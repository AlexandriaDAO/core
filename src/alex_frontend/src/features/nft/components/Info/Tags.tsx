import React from "react";
import { Label } from "@/lib/components/label";
import Copy from "@/components/Copy";
import { Tags as TagsType } from "../../types";

interface TagProps {
    tags?: TagsType;
}

const Tags: React.FC<TagProps> = ({ tags = [] }) => {
    if (tags.length <= 0) return <></>;
    // {/* Tags */}
    // {metadata?.tags && metadata.tags.length > 0 && (
    //     <div className="flex-grow flex flex-col gap-3 overflow-y-auto">
    //         <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Tags</h3>
    //         {/* <div className="space-y-3 max-h-64 overflow-y-auto"> */}
    //         <div className="flex-grow space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
    //             {metadata.tags.map((tag, index) => (
    //                 <div key={index} className="bg-muted/30 rounded-lg p-3 border border-border/50">
    //                     <div className="space-y-1">
    //                         <div className="flex items-center gap-2">
    //                             <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{tag.name}</span>
    //                             <div className="h-px bg-border flex-1"></div>
    //                             <Copy text={tag.value} size="sm" />
    //                         </div>
    //                         <div className="text-sm font-mono text-foreground break-all leading-relaxed">
    //                             {tag.value}
    //                         </div>
    //                     </div>
    //                 </div>
    //             ))}
    //         </div>
    //     </div>
    // )}

	const scrollClasses = "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400";

	return (
		<div className="max-h-full flex flex-col">
            <div className="flex items-center justify-between mb-1">
                <Label className="text-md font-medium">Transaction Tags</Label>
            </div>
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
		</div>
	);
};

export default Tags;
