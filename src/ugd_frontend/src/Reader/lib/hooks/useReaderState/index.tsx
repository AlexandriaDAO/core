// useReaderState.tsx

import Epub, { Book, NavItem, Rendition } from "epubjs";
import {
	Dispatch,
	MutableRefObject,
	RefObject,
	SetStateAction,
	useEffect,
	useRef,
	useState,
} from "react";
import { Location } from "epubjs/types/rendition";

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

// Define the shape of the search state
export interface IReaderState {
	url: string;
	setUrl: Dispatch<SetStateAction<string>>;

	book: Book | null;
	setBook: Dispatch<SetStateAction<Book | null>>;

	renderLocation: RefObject<HTMLDivElement>;
	bookLocation: RefObject<HTMLDivElement>;

	isLoaded: Boolean;
	setIsLoaded: Dispatch<SetStateAction<Boolean>>;

	chapters: NavItem[];
	setChapters: Dispatch<SetStateAction<NavItem[]>>;

	rendition: MutableRefObject<Rendition | null>;

	currentLocation: Location | undefined;
	setCurrentLocation: Dispatch<SetStateAction<Location | undefined>>;

	userSettings: IUserSettingsObject;
	setUserSettings: Dispatch<SetStateAction<IUserSettingsObject>>;

	fullScreen: Boolean;
	setFullScreen: Dispatch<SetStateAction<Boolean>>;

	scroll: string;
	setScroll: Dispatch<SetStateAction<string>>;
}

export const useReaderState = (): IReaderState => {
	const [url, setUrl] = useState("");

	const [book, setBook] = useState<Book | null>(null);

	const renderLocation = useRef<HTMLDivElement>(null);
	const bookLocation = useRef<HTMLDivElement>(null);

	const [isLoaded, setIsLoaded] = useState<Boolean>(false);

	const [chapters, setChapters] = useState<NavItem[]>([]);

	const rendition = useRef<Rendition | null>(null);

	const [currentLocation, setCurrentLocation] = useState<
		Location | undefined
	>(undefined);

	const [userSettings, setUserSettings] = useState<IUserSettingsObject>({
		fontSize: "100%",
		theme: "light",
	});

	const [fullScreen, setFullScreen] = useState<Boolean>(false);

	const [scroll, setScroll] = useState<string>("paginated");

	useEffect(() => {
		if (!book || !book.isOpen) return;

		setChapters(book.navigation.toc);
	}, [book, setChapters]);

	useEffect(() => {
		if (book && book.isOpen && isLoaded && renderLocation.current) {
			const node = renderLocation.current as HTMLDivElement;
			// const width = window.getComputedStyle(node).getPropertyValue('width')
			const newRendition = book.renderTo(node, {
				width: "100%",
				height: "100%",
			});

			rendition.current = newRendition;

			// let location = newRendition.location;
			// // display
			// console.log(newRendition.location);
			newRendition.display(newRendition.location?.start.cfi);

			setCurrentLocation(newRendition.location);
		}
	}, [isLoaded]);

	useEffect(() => {
		console.log(userSettings);
		if (!rendition.current) return;
		if (userSettings.theme === "dark") {
			rendition.current.themes.override("color", "#fff");
			rendition.current.themes.override("background", "#000");
		} else {
			rendition.current.themes.override("color", "#000");
			rendition.current.themes.override("background", "#fff");
		}

		rendition.current?.themes.fontSize(userSettings.fontSize);
	}, [userSettings]);

	// useEffect(() => {
	// 	if (!rendition.current) return;
	// 	const toggleFullScreen = async () => {
	// 		if (!document.fullscreenElement) {
	// 			await rendition.current.;
	// 		} else {
	// 			await document.exitFullscreen();
	// 		}
	// 	};
	// 	toggleFullScreen();
	// }, [fullScreen]);

	useEffect(() => {
		if (url === "") return;
		let newBook = Epub(url, {openAs:'epub'});
		newBook.ready.then(() => {
			setIsLoaded(true);
			setBook(newBook);
		});
	}, [url, setIsLoaded, setBook]);

	return {
		url,
		setUrl,

		book,
		setBook,
		renderLocation,
		bookLocation,
		isLoaded,
		setIsLoaded,
		chapters,
		setChapters,

		rendition,

		currentLocation,
		setCurrentLocation,

		userSettings,
		setUserSettings,

		fullScreen,
		setFullScreen,

		scroll,
		setScroll,
	};
};
