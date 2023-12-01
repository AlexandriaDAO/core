import { useState } from "react";
import { getCurLocaleTime } from "../utils";

export type AnnotationItemObject = {
	text: string;
	cfiRange: string;
	time?: string;
};

export type AnnotationsList = Array<AnnotationItemObject>;

export interface addAnnotationFn {
	// (annotation: Omit<AnnotationItemObject, "time">): void;
	(annotation: AnnotationItemObject): void;
}

export interface removeAnnotationFn {
	(cfiRange: string): void;
}

// Define the shape of the Annotation state
export interface IAnnotationState {
	annotations: AnnotationsList;
	addAnnotation: addAnnotationFn;
	removeAnnotation: removeAnnotationFn;
}

export default function useAnnotationState(): IAnnotationState {
	const [annotations, setAnnotations] = useState<AnnotationsList>([]);

	const addAnnotation: addAnnotationFn = (
		annotation: AnnotationItemObject
	) => {
		if (!annotation.time) annotation.time = getCurLocaleTime();

		setAnnotations([...annotations, annotation]);
	};

	const removeAnnotation: removeAnnotationFn = (cfiRange: string) => {
		const annotationsFilter = annotations.filter(
			(annotation) => annotation.cfiRange !== cfiRange
		);
		setAnnotations(annotationsFilter);
	};

	return {
		annotations,
		addAnnotation,
		removeAnnotation,
	};
}
