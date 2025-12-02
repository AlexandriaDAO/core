import React from "react";

import {
	AnnotationItemStyle as defaultAnnotationItemStyles,
	type IAnnotationItemStyle,
} from "./style";
import type { AnnotationItemObject } from "../../hooks/useAnnotationState";
import {
	useAnnotation,
	useReader,
	useSidebar,
} from "../../hooks/useReaderContext";
import { Trash2 } from "lucide-react";

type IAnnotationItemProps = {
	annotationItem: AnnotationItemObject;
	annotationItemStyles?: IAnnotationItemStyle;
};

export const AnnotationItem: React.FC<IAnnotationItemProps> = ({
	annotationItem,
	annotationItemStyles = defaultAnnotationItemStyles,
}: IAnnotationItemProps) => {
	const { rendition } = useReader();
	const { removeAnnotation } = useAnnotation();
	const { setSidebar } = useSidebar();

	const handleAnnotationItemClick = (i: AnnotationItemObject) => {
		rendition.current && rendition.current.display(i.selection.cfiRange);
		setSidebar(null);
	};

	const handleRemoveAnnotationItemClick = (i: AnnotationItemObject) => {
		rendition.current &&
			rendition.current.annotations.remove(i.selection.cfiRange, "highlight");
		removeAnnotation(i.selection.cfiRange);
	};

	return (
		<div className="relative py-3 flex  justify-between items-start">
			<div className="">
				<button
					onClick={() => handleAnnotationItemClick(annotationItem)}
					style={annotationItemStyles.itemButton}
					className="text-gray-500 hover:text-gray-700 px-0"
				>
					{
						annotationItem.label ? annotationItem.label : annotationItem.selection.text 
					}
				</button>
				<p className="text-indigo-500">
					Added On: {annotationItem.time}
				</p>
			</div>
			<div className="self-start ">
				<Trash2
					size={30}
					onClick={() =>
						handleRemoveAnnotationItemClick(annotationItem)
					}
					className=" cursor-pointer text-red-500 hover:text-red-400"
				/>
			</div>
		</div>
	);
};
