import React, { useCallback, useEffect } from "react";

import {
	ContentViewStyle as defaultContentViewStyles,
	type IContentViewStyle,
} from "./style";
import { useAnnotation, useReader } from "../lib/hooks/useReaderContext";
import { ILocationChangeProps } from "../lib/hooks/useReaderState";
import { Contents } from "epubjs";

import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import FullScreenToggle from "../lib/components/FullScreenToggle";
import Spinner from "../lib/components/Spinner";

export type IContentViewProps = {
	contentViewStyles?: IContentViewStyle;

	swipeable?: boolean;
};

function ContentView(props: IContentViewProps) {
	const {
		rendition,
		isLoaded,
		renderLocation,
		setCurrentLocation,
		fullScreen,
	} = useReader();
	const { addAnnotation } = useAnnotation();

	const next = useCallback(async () => {
		// book?.rendition.next();
		rendition.current && (await rendition.current.next());
	}, [rendition]);
	const prev = useCallback(async () => {
		rendition.current && (await rendition.current.prev());
	}, [rendition]);

	const handleKeyPress = useCallback(
		({ key }: KeyboardEvent) => {
			if (key === "ArrowRight") {
				next();
			} else if (key === "ArrowLeft") {
				prev();
			}
		},
		[next, prev]
	);
	const handleLocationChanged = useCallback(
		(location: ILocationChangeProps) => {
			setCurrentLocation(rendition.current?.location);
		},
		[rendition, setCurrentLocation]
	);

	const handleSelection = useCallback(
		(cfiRange: string, contents: Contents) => {
			if (rendition.current) {
				addAnnotation({
					text: rendition.current.getRange(cfiRange).toString(),
					cfiRange,
				});
				rendition.current.annotations.add(
					"highlight",
					cfiRange,
					{},
					undefined,
					"hl",
					{
						fill: "yellow",
						"fill-opacity": "0.5",
						"mix-blend-mode": "multiply",
					}
				);
				const selection = contents.window.getSelection();
				selection?.removeAllRanges();
			} else {
				console.error(
					"Unable to store annotation, Current Rendition is undefined"
				);
			}
		},
		[rendition, addAnnotation]
	);

	useEffect(() => {
		const currentRendition = rendition.current;
		if (!currentRendition) return;

		document.removeEventListener("keyup", handleKeyPress, false);
		currentRendition.on("keyup", handleKeyPress);
		document.addEventListener("keyup", handleKeyPress, false);

		currentRendition.on("locationChanged", handleLocationChanged);

		currentRendition.on("selected", handleSelection);

		return () => {
			if (currentRendition) {
				document.removeEventListener("keyup", handleKeyPress, false);
				currentRendition.off("keyup", handleKeyPress);

				currentRendition.off("locationChanged", handleLocationChanged);
				currentRendition.off("selected", handleSelection);
				// currentRendition.destroy()
				console.log("Rendition was destroyed");
				// no need to destroy as book.destroy() already does that
			}
		};
	}, [rendition, handleKeyPress, handleLocationChanged, handleSelection]);

	const { contentViewStyles = defaultContentViewStyles } = props;

	return (
		<>
			<IoIosArrowBack
				size={30}
				onClick={prev}
				className="absolute left-2 top-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
			/>

			{fullScreen && <FullScreenToggle />}

			<div style={contentViewStyles.reader}>
				<div style={contentViewStyles.viewHolder}>
					{isLoaded ? (
						<div
							style={{ ...contentViewStyles.view }}
							className="test"
							ref={renderLocation}
						></div>
					) : (
						<div className=" h-full w-full flex items-center justify-center ">
							<Spinner text="Loading" />
						</div>
					)}
				</div>
			</div>

			<IoIosArrowForward
				size={30}
				onClick={next}
				className="absolute right-3 top-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
			/>
		</>
	);
}

export default ContentView;
