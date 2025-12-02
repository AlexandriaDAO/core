import React, { useCallback, useEffect } from "react";

import {
	ContentViewStyle as defaultContentViewStyles,
	type IContentViewStyle,
} from "./style";
import { useAnnotation, useReader } from "../lib/hooks/useReaderContext";
import { ILocationChangeProps } from "../lib/hooks/useReaderState";
import { Contents } from "epubjs";

import Spinner from "../lib/components/Spinner";
import AddAnnotationTooltip from "../lib/components/AddAnnotationTooltip";
import RemoveAnnotationTooltip from "../lib/components/RemoveAnnotationTooltip";
import { CircleArrowLeft, CircleArrowRight } from "lucide-react";

export type IContentViewProps = {
	contentViewStyles?: IContentViewStyle;

	swipeable?: boolean;
};

function ContentView(props: IContentViewProps) {
	const {
		rendition,
		isLoaded,
		loadingProgress,
		renderLocation,
		setCurrentLocation,
		currentLocation,
		book,

		setCurrentPage,
		setTotalPages,
		setPercentage,
	} = useReader();
	const { setCurrentSelection } = useAnnotation();

	const next = useCallback(async () => {
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
			if(!book || !rendition.current) return;


			const startCfi = location && location.start;

			const locations: any = book.locations;
			const currentPage = locations.locationFromCfi(startCfi);
			const totalPage = locations.total;

			setCurrentPage(currentPage);
			setTotalPages(totalPage);
			setPercentage(Math.round((currentPage / totalPage) * 100));

			setCurrentLocation(rendition.current.location);
		},
		[book,rendition, setCurrentLocation]
	);

	// useEffect(() => {
	// 	if (!currentLocation || !book) return;

	// 	// const spineItem = book.spine.get(currentLocation.start.cfi);
	// 	// const navItem = book.navigation.get(spineItem.href);
	// 	// const chapterName = navItem && navItem.label.trim();

	// 	// const locations: any = book.locations;
	// 	// const currentPage = locations.locationFromCfi(currentLocation.start.cfi);
	// 	// const totalPage = locations.total;

	// 	// console.log(chapterName, locations, currentPage, totalPage);


	// 	// let progress = book.locations.percentageFromCfi(currentLocation.start.cfi);
	// 	// console.log('Progress:', progress); // The % of how far along in the book you are
	// 	// console.log('Locations:', book.locations);
	// 	// console.log('Current Page:', book.locations.locationFromCfi(currentLocation.start.cfi));
	// 	// console.log('Total Pages:', book.locations.total);


	// 	const startCfi = currentLocation && currentLocation.start;

	// 	const current = book.locations.locationFromCfi(startCfi.cfi);
	// 	const total = book.locations.total;

	// 	// setCurrentPage(current);
	// 	// setTotalPages(total);
	// 	// setPercentage(Math.round((current / total) * 100));


	// 	console.log('currentpage', current);
	// 	console.log('totalpage', total);
	// 	console.log('percent', Math.round(Math.round((current / total) * 100)));

	// 	const spineItem = book.spine.get(startCfi);
	// 	const navItem = book.navigation.get(spineItem.href);
	// 	const chapter = navItem && navItem.label.trim();
	// 	// setChapterName(chapter);

	// 	console.log('currentchapter', chapter);



	// }, [currentLocation]);

	const handleSelection = useCallback(
		(cfiRange: string, contents: Contents) => {
			if (rendition.current) {
				const range = rendition.current.getRange(cfiRange);
				const selection = {
					text: range.toString(),
					cfiRange,
				};
				setCurrentSelection(selection);
			} else {
				setCurrentSelection(null);
				console.error(
					"Unable to store annotation, Current Rendition is undefined"
				);
			}
		},
		[rendition, setCurrentSelection, renderLocation]
	);

	const handleClick = (e: any) => {
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
			}
		};
	}, [
		rendition,
		handleKeyPress,
		handleLocationChanged,
		handleSelection,
		handleClick,
	]);

	const { contentViewStyles = defaultContentViewStyles } = props;

	return (
		<>
			<CircleArrowLeft
				size={30}
				onClick={prev}
				className="absolute left-2 z-30 top-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
			/>
			<div style={contentViewStyles.reader}>
				<div style={contentViewStyles.viewHolder}>
					{isLoaded ? (
						<>
							<div
								style={{ ...contentViewStyles.view }}
								ref={renderLocation}
							></div>
						</>
					) : (
						<div className=" h-full w-full flex flex-col gap-2 items-center justify-center font-roboto-condensed text-xl">
							<Spinner text="Loading" />
							<div className="w-60 bg-gray-300 rounded-full ">
								<div className="bg-[#393939] text-xs font-medium text-white text-center p-0.5 leading-none rounded-full" style={{width: loadingProgress+"%"}}> {loadingProgress}%</div>
							</div>
						</div>
					)}
				</div>
			</div>
			<CircleArrowRight
				size={30}
				onClick={next}
				className="absolute right-2 top-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
			/>
			<AddAnnotationTooltip />
			<RemoveAnnotationTooltip />
		</>
	);
}

export default ContentView;
