import React, { SetStateAction, useEffect, useState } from "react";
import { getCurLocaleTime } from "../utils";

export type TextSelection= {
	text: string;
	cfiRange: string;
}

export type AnnotationItemObject = {
	selection: TextSelection
	color: Colors
	label?: string
	time?: string
};

export type AnnotationsList = Array<AnnotationItemObject>;

export interface addAnnotationFn {
	// (annotation: Omit<AnnotationItemObject, "time">): void;
	(selection: TextSelection): void;
}

export interface removeAnnotationFn {
	(cfiRange: string): void;
}

export type PopupPosition = {
	x: number;
	y: number;
}



export enum Colors {
	Yellow = '#FFFF00', // default
    Coral = '#FF7F50',
	SkyBlue = '#1E90FF',
    LimeGreen = '#32CD32',
}

export const colors = Object.entries(Colors);

// Define the shape of the Annotation state
export interface IAnnotationState {

	color: Colors,
	setColor: React.Dispatch<SetStateAction<Colors>>;

	annotations: AnnotationsList;
	addAnnotation: addAnnotationFn;
	removeAnnotation: removeAnnotationFn;
	currentSelection: TextSelection | null
	setCurrentSelection: React.Dispatch<SetStateAction<TextSelection|null>>;

	currentAnnotation: TextSelection | null;
	setCurrentAnnotation: React.Dispatch<SetStateAction<TextSelection|null>>;

	showAddPopup: boolean;
	setShowAddPopup: React.Dispatch<SetStateAction<boolean>>;

	addPopupPosition: PopupPosition | null;
	setAddPopupPosition: React.Dispatch<SetStateAction<PopupPosition | null>>;


	showRemovePopup: boolean;
	setShowRemovePopup: React.Dispatch<SetStateAction<boolean>>;

	removePopupPosition: PopupPosition | null;
	setRemovePopupPosition: React.Dispatch<SetStateAction<PopupPosition | null>>;
}


export default function useAnnotationState(): IAnnotationState {
    const [color, setColor] = useState<Colors>(Colors.Yellow);

	const [label, setLabel] = useState("")
	const [annotations, setAnnotations] = useState<AnnotationsList>([]);
	const [currentSelection, setCurrentSelection] = useState<TextSelection|null>(null);
	const [currentAnnotation, setCurrentAnnotation] = useState<TextSelection|null>(null);

	const [showAddPopup, setShowAddPopup] = useState(false);
	const [addPopupPosition, setAddPopupPosition] = useState<PopupPosition|null>(null);

	const [showRemovePopup, setShowRemovePopup] = useState(false);
	const [removePopupPosition, setRemovePopupPosition] = useState<PopupPosition|null>(null);

	const addAnnotation: addAnnotationFn = (
		selection: TextSelection
	) => {
		const annotation = {
			selection,
			label,
			color,
			time:  getCurLocaleTime()
		}
		setAnnotations([...annotations, annotation]);

		setCurrentSelection(null);
		setColor(Colors.Yellow)
	};

	const removeAnnotation: removeAnnotationFn = (cfiRange: string) => {
		const annotationsFilter = annotations.filter(
			(annotation) => annotation.selection.cfiRange !== cfiRange
		);
		setAnnotations(annotationsFilter);
	};

	return {

		color,
		setColor,
		annotations,
		addAnnotation,
		removeAnnotation,
		currentSelection,
		setCurrentSelection,

		currentAnnotation,
		setCurrentAnnotation,

		showAddPopup,
		setShowAddPopup,
		addPopupPosition,
		setAddPopupPosition,

		showRemovePopup,
		setShowRemovePopup,
		removePopupPosition,
		setRemovePopupPosition,
	};
}
