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
import { PackagingMetadataObject } from "epubjs/types/packaging";

export interface IUserSettingsObject {
	fontFamily: string;
	fontSize: number;
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

	metadata: PackagingMetadataObject | null;
	setMetadata: Dispatch<SetStateAction<PackagingMetadataObject | null>>;

	coverUrl: string|null;
	setCoverUrl: Dispatch<SetStateAction<string|null>>;

	renderLocation: RefObject<HTMLDivElement | null>;
	bookLocation: RefObject<HTMLDivElement | null>;

	isLoaded: Boolean;
	setIsLoaded: Dispatch<SetStateAction<Boolean>>;

	loadingProgress: number; // Add loading progress state
	setLoadingProgress: Dispatch<SetStateAction<number>>;

	firstPageLoaded: Boolean;
	setFirstPageLoaded: Dispatch<SetStateAction<Boolean>>;

	chapters: NavItem[];
	setChapters: Dispatch<SetStateAction<NavItem[]>>;

	rendition: MutableRefObject<Rendition | null>;

	currentLocation: Location | undefined;
	setCurrentLocation: Dispatch<SetStateAction<Location | undefined>>;

	currentPage: number;
	setCurrentPage: Dispatch<SetStateAction<number>>;

	totalPages: number;
	setTotalPages: Dispatch<SetStateAction<number>>;

	percentage: number;
	setPercentage: Dispatch<SetStateAction<number>>;


	userSettings: IUserSettingsObject;
	setUserSettings: Dispatch<SetStateAction<IUserSettingsObject>>;

	fullScreen: Boolean;
	setFullScreen: Dispatch<SetStateAction<Boolean>>;

	flow: string;
	setFlow: Dispatch<SetStateAction<string>>;

	spread: string;
	setSpread: Dispatch<SetStateAction<string>>;
}

export const useReaderState = (): IReaderState => {
	const [url, setUrl] = useState("");

	const [book, setBook] = useState<Book | null>(null);
	const [metadata, setMetadata] = useState<PackagingMetadataObject|null>(null)
	const [coverUrl, setCoverUrl] = useState<string|null>(null)

	const renderLocation = useRef<HTMLDivElement>(null);
	const bookLocation = useRef<HTMLDivElement>(null);

	const [isLoaded, setIsLoaded] = useState<Boolean>(false);
	const [loadingProgress, setLoadingProgress] = useState(0); // Initialize loading progress

	const [firstPageLoaded, setFirstPageLoaded] = useState<Boolean>(false);

	const [chapters, setChapters] = useState<NavItem[]>([]);

	const rendition = useRef<Rendition | null>(null);

	const [currentLocation, setCurrentLocation] = useState<
		Location | undefined
	>(undefined);

	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [percentage, setPercentage] = useState(0);

	const [userSettings, setUserSettings] = useState<IUserSettingsObject>({
		fontFamily: "auto",
		fontSize: 18,
		theme: "light",
	});

	const [fullScreen, setFullScreen] = useState<Boolean>(false);

	const [flow, setFlow] = useState<string>("paginated");
	const [spread, setSpread] = useState<string>("auto");

	useEffect(() => {
		if (!book || !book.isOpen) return;

		// Check if navigation and toc exist before setting
		if (book.navigation && book.navigation.toc) {
			setChapters(book.navigation.toc);
		} else {
			// Set default empty array if navigation or toc is not available
			setChapters([]);
		}
	}, [book, setChapters]);

	useEffect(() => {
		if (book && book.isOpen && isLoaded && renderLocation.current) {
			// Additional validation before creating rendition
			if (!book.packaging || !book.packaging.manifest) {
				console.error("Cannot create rendition: Book missing package information");
				return;
			}

			const node = renderLocation.current as HTMLDivElement;

			try {
				const newRendition = book.renderTo(node, {
					width: "100%",
					height: "100%",
				});

				rendition.current = newRendition;

				// Display with error handling
				const startCfi = newRendition.location?.start?.cfi;
				newRendition.display(startCfi).catch((err) => {
					console.warn("Error displaying initial location:", err);
					// Try to display from the beginning
					newRendition.display();
				});

				newRendition.on('rendered', ()=>{
					setCurrentLocation(newRendition.location);
					setFirstPageLoaded(true);
				});

				newRendition.on('displayError', (error:any) => {
					console.error("Rendition load error:", error);
				});
			} catch (error) {
				console.error("Error creating rendition:", error);
			}
		}
	}, [isLoaded]);

	useEffect(() => {
		if (!rendition.current) return;
		if (userSettings.theme === "dark") {
			rendition.current.themes.override("color", "#fff");
			rendition.current.themes.override("background", "#000");
		} else {
			rendition.current.themes.override("color", "#000");
			rendition.current.themes.override("background", "#fff");
		}

		rendition.current.themes.fontSize(userSettings.fontSize + "px");
		rendition.current.themes.font(userSettings.fontFamily);

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

		const xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.responseType = "blob";
	
		// Update progress
		xhr.onprogress = (event) => {
			if (event.lengthComputable) {
				const percentComplete = (event.loaded / event.total) * 100;
				setLoadingProgress(Math.round(percentComplete));
			}
		};
	
		// On load
		xhr.onload = () => {
			if (xhr.status === 200) {
				const blobUrl = URL.createObjectURL(xhr.response);
				let newBook = Epub(blobUrl, {openAs:'epub'});
				newBook
					.ready
					.then(() => {
						// Validate that the book has essential package information
						if (!newBook.packaging || !newBook.packaging.manifest) {
							throw new Error("Invalid EPUB: Missing package information");
						}

						// Check if navigation exists before proceeding
						if (!newBook.navigation || !newBook.navigation.toc) {
							console.warn("EPUB missing navigation or toc");
						}

						newBook.loaded.metadata.then(metadata=>setMetadata(metadata))

						newBook.coverUrl().then(url=>setCoverUrl(url)).catch(() => {
							console.warn("Could not load cover URL");
							setCoverUrl(null);
						})

						setIsLoaded(true);
						setBook(newBook);
					})
					.then(()=>{
						const stored = localStorage.getItem(newBook.key() + '-locations');
						if (stored) {
							return newBook.locations.load(stored);
						} else {
							return newBook.locations.generate(1024);
						}
					})
					.then(() => {
						localStorage.setItem(newBook.key() + '-locations', newBook.locations.save());
					}).catch((err) => {
						console.log('Error while saving locations in localstorage',err);
					})
					.catch((err) => {
						console.error('Error loading EPUB:', err);
						// Don't set the book if there's an error
						setIsLoaded(false);
						setBook(null);
						// You could also set an error state here if you have one
					});
			}
		};
	
		// Handle errors
		xhr.onerror = () => {
		  	console.error("Error loading the EPUB file.");
		};
	
		xhr.send();
	
		// Cleanup function
		return () => {
		  	xhr.abort();
		};
	}, [url, setIsLoaded, setBook]);

	return {
		url,
		setUrl,

		book,
		setBook,

		metadata,
		setMetadata,

		coverUrl,
		setCoverUrl,

		renderLocation,
		bookLocation,

		isLoaded,
		setIsLoaded,

		loadingProgress, // Expose loading progress
		setLoadingProgress,

		firstPageLoaded,
		setFirstPageLoaded,

		chapters,
		setChapters,

		rendition,

		currentLocation,
		setCurrentLocation,


		currentPage,
		setCurrentPage,

		totalPages,
		setTotalPages,

		percentage,
		setPercentage,

		userSettings,
		setUserSettings,

		fullScreen,
		setFullScreen,

		flow,
		setFlow,

		spread,
		setSpread,
	};
};
