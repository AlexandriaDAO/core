// useReaderState.tsx

import { Book, Contents, NavItem, Rendition } from "epubjs";
import { DisplayedLocation } from "epubjs/types/rendition";
import {
	Dispatch,
	RefObject,
	SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import useAnnotationState from "../useAnnotationState";
import { ContentList, useContentState } from "./useContentState";
import { convert } from "html-to-text";

export interface IUserSettingsObject {
	fontSize: string;
	theme: string;
}
export interface ILocationChangeProps {
	end: string;
	href: string;
	index: number;
	percentage: number;
	start: string;
}

// Define the shape of the context data
export interface IBookState {
	book: Book | null;
	setBook: Dispatch<SetStateAction<Book | null>>;

	renderLocation: RefObject<HTMLDivElement>;

	isLoaded: Boolean;
	setIsLoaded: Dispatch<SetStateAction<Boolean>>;

	chapters: NavItem[];
	setChapters: Dispatch<SetStateAction<NavItem[]>>;

	rendition: React.MutableRefObject<Rendition | null>;

	currentLocation: DisplayedLocation | undefined;
	setCurrentLocation: Dispatch<SetStateAction<DisplayedLocation | undefined>>;

	userSettings: IUserSettingsObject;
	setUserSettings: Dispatch<SetStateAction<IUserSettingsObject>>;
}

export const useBookState = (): IBookState => {
	const [book, setBook] = useState<Book | null>(null);

	const renderLocation = useRef<HTMLDivElement>(null);

	const [isLoaded, setIsLoaded] = useState<Boolean>(false);

	const [chapters, setChapters] = useState<NavItem[]>([]);

	const rendition = useRef<Rendition | null>(null);
	const [currentLocation, setCurrentLocation] = useState<
		DisplayedLocation | undefined
	>(undefined);

	const [userSettings, setUserSettings] = useState<IUserSettingsObject>({
		fontSize: "100%",
		theme: "light",
	});

	useEffect(() => {
		if (book && book.isOpen) {
			// book.navigation should be accessible as we already await for book.ready in useReader
			setChapters(book.navigation.toc);
		}
		return () => {
			if (book) {
				try {
					book.destroy();
					console.log("Book was destroyed");
				} catch {
					console.error("Book could not be destroyed");
				}
			}
		};
	}, [book, setChapters]);

	const { setContents } = useContentState();

	useEffect(() => {
		if (book) {
			const loadContents = async () => {
				// book.spine should be accessible as we already await for book.ready in useReader
				book.loaded.spine.then(async (spine) => {
					const contents: ContentList = [];

					for (let item of (spine as any).items) {
						if (!item.href) continue;

						const doc = await book.load(item.href);
						const innerHTML = (doc as Document).documentElement
							.innerHTML;
						const innerText = convert(innerHTML);

						contents.push({
							href: item.href,
							text: innerText.split(/\n+/),
						});
					}
					setContents(contents);
				});
			};
			loadContents();
		}
	}, [book, setContents]);

	const handleLocationChanged = useCallback(
		(location: ILocationChangeProps) => {
			// index: this.location.start.index,
			// href: this.location.start.href,
			// start: this.location.start.cfi,
			// end: this.location.end.cfi,
			// percentage: this.location.start.percentage

			setCurrentLocation(rendition.current?.location.start);

			// currentChapter = currentLocation.href;
			// readingProgress = currentLocation.percentage
			// currentCfi = currentLocation.cfi

			// setCurrentChapter(href);
			// setPercentage(percentage);
			// setCurrentCfi(start);

			// setCurrentCfi(epubRendition.location.start.cfi);
			// setAtStart(epubRendition.location.atStart);
			// setAtEnd(epubRendition.location.atEnd);
		},
		[rendition]
	);

	const { addAnnotation } = useAnnotationState();
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
		[addAnnotation]
	);

	useEffect(() => {
		let currentRendition = rendition.current;

		if (book && book.isOpen && isLoaded && renderLocation.current) {
			const node = renderLocation.current as HTMLDivElement;
			// const width = window.getComputedStyle(node).getPropertyValue('width')
			const newRendition = book.renderTo(node, {
				width: "100%",
				height: "100%",
			});

			let location = newRendition.location?.start;
			// display
			newRendition.display(location?.cfi);

			// do something when location changes
			newRendition.on("locationChanged", handleLocationChanged);

			// do something when text is selected
			newRendition.on("selected", handleSelection);

			rendition.current = newRendition;

			setCurrentLocation(location);
		}
		return () => {
			try {
				if (currentRendition) {
					currentRendition.off(
						"locationChanged",
						handleLocationChanged
					);
					currentRendition.off("selected", handleSelection);
					currentRendition.destroy();
					console.log("Rendition was destroyed");
				}
			} catch {
				console.error("Rendition could not be destroyed");
			}
		};
	}, [book, isLoaded, rendition, handleLocationChanged, handleSelection]);

	useEffect(() => {
		if (!rendition.current) return;
		if (userSettings.theme === "dark") {
			rendition.current?.themes.override("color", "#fff");
			rendition.current?.themes.override("color", "#000");
		} else {
			rendition.current?.themes.override("color", "#000");
			rendition.current?.themes.override("background", "#fff");
		}

		rendition.current?.themes.fontSize(userSettings.fontSize);
	}, [userSettings]);
	return {
		book,
		setBook,
		renderLocation,
		isLoaded,
		setIsLoaded,
		chapters,
		setChapters,

		rendition,

		currentLocation,
		setCurrentLocation,

		userSettings,
		setUserSettings,
	};
};
