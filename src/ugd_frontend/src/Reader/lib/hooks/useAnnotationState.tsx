import React, { SetStateAction, useState } from "react";
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


export enum Colors {
	Yellow = '#FFFF00', // default
    Coral = '#FF7F50',
	SkyBlue = '#1E90FF',
    LimeGreen = '#32CD32',
    Goldenrod = '#DAA520',
    MediumOrchid = '#BA55D3'
}

export const colors = Object.entries(Colors);

// Define the shape of the Annotation state
export interface IAnnotationState {
	label: string,
	setLabel: React.Dispatch<SetStateAction<string>>;

	color: Colors,
	setColor: React.Dispatch<SetStateAction<Colors>>;

	annotations: AnnotationsList;
	addAnnotation: addAnnotationFn;
	removeAnnotation: removeAnnotationFn;
	currentSelection: TextSelection | null
	setCurrentSelection: React.Dispatch<SetStateAction<TextSelection|null>>;
}


export default function useAnnotationState(): IAnnotationState {


    const [color, setColor] = useState<Colors>(Colors.Yellow);

	const [label, setLabel] = useState("")
	const [annotations, setAnnotations] = useState<AnnotationsList>([]);
	const [currentSelection, setCurrentSelection] = useState<TextSelection|null>(null);

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

		setLabel(""),
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
		label,
		setLabel,
		color,
		setColor,
		annotations,
		addAnnotation,
		removeAnnotation,
		currentSelection,
		setCurrentSelection
	};
}
