import React, { useState } from "react";
import {
	AnnotationsStyle as defaultAnnotationsStyles,
	type IAnnotationsStyle,
} from "./style";
import { useAnnotation, useReader } from "../../lib/hooks/useReaderContext";
import { AnnotationItem } from "../../lib/components/AnnotationItem";
import { Tooltip } from "antd";
import { clashCfiRange, compareCfi } from "@/Reader/lib/utils/annotations";
import ColorSelector from "./ColorSelector";
import Accordion from "./Accordion";

interface IAnnotationsProps {
	annotationsStyle?: IAnnotationsStyle;
}

export const Annotations: React.FC<IAnnotationsProps> = ({
	annotationsStyle = defaultAnnotationsStyles,
}) => {
	const {
		rendition,
		renderLocation
	} = useReader();
	const { annotations, color, currentSelection, addAnnotation, label, setLabel } = useAnnotation();

	const checkForOverlap = (newCfiRange:string) => {
		return annotations.some(annotation => {
			return clashCfiRange(newCfiRange, annotation.selection.cfiRange);
		});
	};
	
	const handleAddAnnotationClick = ()=>{
		if(!currentSelection || !rendition || !rendition.current) return;

		if (checkForOverlap(currentSelection.cfiRange)) {
			// Handle the case where there is an overlap
			alert('Selected range overlaps with an existing annotation')
			console.log("Selected range overlaps with an existing annotation.");
		} else {
			// No overlap, proceed with adding the annotation
			addAnnotation(currentSelection);
			
			rendition.current.annotations.add(
				"highlight",
				currentSelection.cfiRange,
				{},
				undefined,
				"hl",
				{
					fill: color,
					"fill-opacity": "0.5",
					"mix-blend-mode": "multiply",
				}
			);
	
			const iframe = renderLocation.current?.querySelector('iframe');
			if (!iframe) return;
		
			const iframeWin = iframe.contentWindow;
			if (!iframeWin) return;
		
			const selection = iframeWin.getSelection();
			selection?.removeAllRanges();		
		}
	}


	return (
		<div className="h-full overflow-hidden flex flex-col">
			<p className="font-semibold text-lg text-center py-2">
				Annotations
			</p>
			<div className=" flex flex-col flex-grow overflow-auto">
				<Accordion
					title="Add Annotation"
					isOpen={true}
					body={
						<div className="p-3 w-full flex flex-col gap-1 bg-cyan-100 text-teal-600 border border-cyan-500 rounded-md">
							<div>
								<label
									className="block text-gray-700 text-sm font-bold mb-1"
									htmlFor="label"
								>
									Label
								</label>
								<input
									value={label}
									onChange={(e) => setLabel(e.target.value)}
									className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
									id="label"
									type="text"
									placeholder="Annotation Label"
								/>
							</div>
							<div>
								<label
									className="block text-gray-700 text-sm font-bold mb-1"
									htmlFor="label"
								>
									Color
								</label>
								<ColorSelector />
							</div>
							<div>
								<label
									className="block text-gray-700 text-sm font-bold mb-1"
									htmlFor="annotationText"
								>
									Annotation Text
								</label>
								<Tooltip title="Not Editable">
									<textarea
										id="annotationText"
										placeholder="Select a text from book"
										className="p-2 shadow appearance-none border focus:outline-none focus:shadow-outline rounded w-full bg-gray-200"
										value={
											currentSelection
												? currentSelection.text
												: ""
										}
										readOnly={true}
										rows={3}
									></textarea>
								</Tooltip>
							</div>
							<div>
								<label
									className="block text-gray-700 text-sm font-bold mb-1"
									htmlFor="cfiRange"
								>
									Cfi Range
								</label>
								<Tooltip title="Not Editable">
									<input
										id="cfiRange"
										placeholder="Select a text from book"
										className="p-2 shadow appearance-none border focus:outline-none focus:shadow-outline rounded w-full bg-gray-200"
										value={
											currentSelection
												? currentSelection.cfiRange
												: ""
										}
										readOnly={true}
									/>
								</Tooltip>
							</div>
							<button
								onClick={handleAddAnnotationClick}
								disabled={currentSelection == null}
								className={`${
									currentSelection == null
										? "bg-blue-300"
										: "bg-blue-500"
								}  text-white rounded-lg px-4 py-2 mt-2`}
							>
								Add
							</button>
						</div>
					}
				/>
				<div className="flex-grow">
					<Accordion
						title={`List of Annotations ${annotations?.length > 0 ? '('+annotations.length+')' : '' }`}
						body={
							<>
								{annotations?.map((item, i) => (
									<div  key={i} className="bg-cyan-100 px-3 py-1 my-1 text-teal-600 border border-cyan-500 rounded-md">
										<AnnotationItem annotationItem={item} />
									</div>
								))}
								{annotations.length === 0 && (
									<div>No Annotation found</div>
								)}
							</>
						}
					/>
				</div>
			</div>

		</div>
	);
};
