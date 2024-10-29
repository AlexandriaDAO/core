import React, { useEffect, useState } from "react";
import ColorSelector from "./ColorSelector";
import { useAnnotation, useReader } from "../hooks/useReaderContext";
import { clashCfiRange, getAddPopupPosition, getRemovePopupPosition } from "../utils/annotations";
import { toast } from "sonner";

function AddAnnotationTooltip() {
	const { rendition, currentLocation, renderLocation } = useReader();
	const {
        annotations, color,
        addAnnotation, currentSelection, setCurrentAnnotation, showAddPopup, setShowAddPopup, setShowRemovePopup, addPopupPosition, setAddPopupPosition,setRemovePopupPosition,   } = useAnnotation();


	useEffect(() => {
		if (!currentSelection) {
            setShowAddPopup(false)
            setAddPopupPosition(null);
        }else{
            const position = getAddPopupPosition(renderLocation.current);
            if(position){
                setAddPopupPosition({ x: position.x, y: position.y });
                setShowAddPopup(true)
            }
        }
	}, [currentSelection]);

	useEffect(() => {
		setShowAddPopup(false);
	}, [rendition, currentLocation, renderLocation]);


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
			rendition.current.annotations.remove(currentSelection.cfiRange, 'highlight');
			rendition.current.annotations.highlight(
				currentSelection.cfiRange,
				{},
				()=>{
					console.log('cfi',currentSelection.cfiRange);

					const range = rendition.current?.getRange(currentSelection.cfiRange);
					console.log('range',range);
					if(range){
						const position = getRemovePopupPosition(renderLocation.current, range)
						console.log('position', position);
						if(position){
							setCurrentAnnotation(currentSelection)
							setRemovePopupPosition({ x: position.x, y: position.y });
							setShowRemovePopup(true)
						}
					}
				},
				"h1",
				{
					fill: color,
					"fill-opacity": "0.5",
					"mix-blend-mode": "multiply",
					cursor: 'pointer',
					"pointer-events": "fill",
					transition: ".1s ease-in-out"
				}
			)
			addAnnotation(currentSelection);

			const iframe = renderLocation.current?.querySelector('iframe');
			if (!iframe) return;

            const iframeWin = iframe.contentWindow;
			if (!iframeWin) return;

            const selection = iframeWin.getSelection();
			selection?.removeAllRanges();
		}
        setShowAddPopup(false);
	}

	return (
        <>
            {currentSelection && showAddPopup && addPopupPosition && <div
                className="absolute bg-[#393939] text-white p-2 shadow-lg rounded my-2 font-roboto-condensed text-xs"
                style={{
                    top: addPopupPosition?.y,
                    left: addPopupPosition?.x,
                }}
            >
                <div
                    className="absolute w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-[#393939]"
                    style={{
                        top: "-8px",
                        left: "10px", // Position the tip on the extreme left side
                        transform: "translateX(0)", // Align tip with the left side
                    }}
                ></div>
                <div className="flex justify-center items-center gap-2">
                    <ColorSelector />
                    <button onClick={handleAddAnnotationClick} className="hover:underline"> Create A Card </button>
                </div>
            </div>}
        </>
	);
}

export default AddAnnotationTooltip;
