import React, { useEffect, useState } from "react";
import { useAnnotation, useReader } from "../hooks/useReaderContext";

function RemoveAnnotationTooltip() {
	const { rendition, currentLocation, renderLocation } = useReader();
	const { removeAnnotation, currentAnnotation, setCurrentAnnotation, showRemovePopup,setShowRemovePopup, removePopupPosition, setRemovePopupPosition  } = useAnnotation();


	useEffect(() => {
		setShowRemovePopup(false);
		setCurrentAnnotation(null)
	}, [rendition, currentLocation, renderLocation]);

    const handleRemoveAnnotationClick = ()=>{
		if(!currentAnnotation || !rendition || !rendition.current) return;
		rendition.current && rendition.current.annotations.remove(currentAnnotation.cfiRange, "highlight");
		removeAnnotation(currentAnnotation.cfiRange);
		setShowRemovePopup(false);
		setCurrentAnnotation(null);
		setRemovePopupPosition(null);
	}

	return (
        <>
            {showRemovePopup && removePopupPosition && <div
                className="absolute bg-[#393939] text-white p-2 shadow-lg rounded my-2 font-roboto-condensed text-xs"
                style={{
                    top: removePopupPosition?.y,
                    left: removePopupPosition?.x,
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
                    <button
					onClick={handleRemoveAnnotationClick}
					className="hover:underline"> Remove Card </button>
                </div>
            </div>}
        </>
	);
}

export default RemoveAnnotationTooltip;
