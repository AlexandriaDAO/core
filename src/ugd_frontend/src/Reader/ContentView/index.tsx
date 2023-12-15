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
	const { addAnnotation, currentSelection, setCurrentSelection } = useAnnotation();

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
				const selection = {
					text: rendition.current.getRange(cfiRange).toString(),
					cfiRange
				}
				setCurrentSelection(selection);
			} else {
				setCurrentSelection(null);
				console.error(
					"Unable to store annotation, Current Rendition is undefined"
				);
			}
		},
		[rendition, addAnnotation]
	);

	const handleClick = (e: any) => {
		// console.log('inside', e);
		// const iframe = renderLocation.current?.querySelector('iframe');
		// if (!iframe) return;
	
		// const iframeWin = iframe.contentWindow;
		// if (!iframeWin) return;
	
		// const selection = iframeWin.getSelection();

		// console.log(selection);
		// if (!selection || selection.isCollapsed) {

		// 	const selectionText = selection?.toString();
		// 	console.log(selectionText);
		
		// 	// The selection is empty or collapsed, handle the deselection
		// }
		setCurrentSelection(null);
	};

	useEffect(() => {
		const currentRendition = rendition.current;
		if (!currentRendition) return;

		document.removeEventListener("keyup", handleKeyPress, false);
		currentRendition.on("keyup", handleKeyPress);
		document.addEventListener("keyup", handleKeyPress, false);

		currentRendition.on("locationChanged", handleLocationChanged);

		currentRendition.on("selected", handleSelection);
	
		currentRendition.on("click", handleClick);

		return () => {
			if (currentRendition) {
				document.removeEventListener("keyup", handleKeyPress, false);
				currentRendition.off("keyup", handleKeyPress);

				currentRendition.off("locationChanged", handleLocationChanged);
				currentRendition.off("selected", handleSelection);
				currentRendition.off("click", handleClick);
				// currentRendition.destroy()
				console.log("Rendition was destroyed");
			}			
		};
	}, [rendition, handleKeyPress, handleLocationChanged, handleSelection, handleClick]);

	const { contentViewStyles = defaultContentViewStyles } = props;

	return (
		<>
			<IoIosArrowBack
				size={30}
				onClick={prev}
				className="absolute left-2 z-30 top-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
			/>

			{/* {fullScreen && <FullScreenToggle />} */}

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
				className="absolute right-2 top-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
			/>
		</>
	);
}

export default ContentView;
