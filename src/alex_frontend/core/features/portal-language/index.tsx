import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect, useRef, useState } from "react";
import { Language, setSelected, setVisible } from "./portalLanguageSlice";
import { CircleFlag } from "react-circle-flags";
import { setLanguages } from "../portal-filter/portalFilterSlice";
import { ChevronDown, Search } from "lucide-react";

const languages: Language[] = [
	{ code: "en", name: "English", flag: "us" },
	{ code: "es", name: "Spanish", flag: "es" },
	{ code: "fr", name: "French", flag: "fr" },
	{ code: "de", name: "German", flag: "de" },
	{ code: "it", name: "Italian", flag: "it" },
	{ code: "ja", name: "Japanese", flag: "jp" },
	{ code: "ko", name: "Korean", flag: "kr" },
	{ code: "zh", name: "Chinese", flag: "cn" },
	{ code: "pt", name: "Portuguese", flag: "pt" },
	{ code: "ru", name: "Russian", flag: "ru" },
	{ code: "ar", name: "Arabic", flag: "sa" },
	{ code: "hi", name: "Hindi", flag: "in" },
	{ code: "bn", name: "Bengali", flag: "bd" },
	{ code: "pa", name: "Punjabi", flag: "in" },
	{ code: "jv", name: "Javanese", flag: "id" },
	{ code: "vi", name: "Vietnamese", flag: "vn" },
	{ code: "ta", name: "Tamil", flag: "in" },
	{ code: "tr", name: "Turkish", flag: "tr" },
	{ code: "fa", name: "Persian", flag: "ir" },
	{ code: "ur", name: "Urdu", flag: "pk" },
	{ code: "pl", name: "Polish", flag: "pl" },
	{ code: "uk", name: "Ukrainian", flag: "ua" },
	{ code: "nl", name: "Dutch", flag: "nl" },
	{ code: "ro", name: "Romanian", flag: "ro" },
	{ code: "el", name: "Greek", flag: "gr" },
	{ code: "hu", name: "Hungarian", flag: "hu" },
	{ code: "th", name: "Thai", flag: "th" },
	{ code: "sv", name: "Swedish", flag: "se" },
	{ code: "fi", name: "Finnish", flag: "fi" },
	{ code: "no", name: "Norwegian", flag: "no" },
	{ code: "da", name: "Danish", flag: "dk" },
	{ code: "cs", name: "Czech", flag: "cz" },
	{ code: "sk", name: "Slovak", flag: "sk" },
	{ code: "bg", name: "Bulgarian", flag: "bg" },
	{ code: "sr", name: "Serbian", flag: "rs" },
	{ code: "hr", name: "Croatian", flag: "hr" },
	{ code: "lt", name: "Lithuanian", flag: "lt" },
	{ code: "lv", name: "Latvian", flag: "lv" },
	{ code: "et", name: "Estonian", flag: "ee" },
	{ code: "sl", name: "Slovenian", flag: "si" },
	{ code: "he", name: "Hebrew", flag: "il" },
	{ code: "id", name: "Indonesian", flag: "id" },
	{ code: "ms", name: "Malay", flag: "my" },
	{ code: "tl", name: "Tagalog", flag: "ph" },
	{ code: "sw", name: "Swahili", flag: "ke" },
	{ code: "am", name: "Amharic", flag: "et" },
	{ code: "yo", name: "Yoruba", flag: "ng" },
	{ code: "zu", name: "Zulu", flag: "za" },
	// Add more languages as needed
];

function PortalLanguage() {
	const dispatch = useAppDispatch();
	const { selected, visible } = useAppSelector(
		(state) => state.portalLanguage
	);
	const { books } = useAppSelector(state => state.portal);
	const dropdownRef = useRef<HTMLDivElement>(null);

	function handleClick() {
		dispatch(setVisible(!visible));
	}

	const [searchTerm, setSearchTerm] = useState("");

	const handleCheckboxChange = (
		language: Language,
		e?: React.ChangeEvent<HTMLInputElement>
	) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

        const isSelected = selected.find(({code})=>code == language.code)

		if (isSelected === undefined) {
			dispatch(setSelected([...selected, language]));
		} else {
			dispatch(setSelected(selected.filter(({code}) => code !== language.code)));
		}
	};

	const handleClearClick = () => {
		dispatch(setSelected([]));
	};
	function handleApplyClick(){
		dispatch(setLanguages(selected))
	}

	const filteredLanguages = languages.filter((language) =>
		language.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				dispatch(setVisible(false));
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [dispatch]);
	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={handleClick}
				className="py-1 text-xl flex items-center justify-between gap-4 border-b border-solid border-black"
			>
				<span>Language</span>
				{selected.length > 0 && (
					<span className="absolute top-0 right-4 w-4 h-4 p-[10px] flex justify-center items-center bg-black text-brightyellow font-roboto-condensed font-medium text-sm rounded-full">
						{selected.length}
					</span>
				)}
				<div
					className={`transform transition-transform duration-200 ${
						visible ? "rotate-180" : "rotate-0"
					}`}
				>
					<ChevronDown size={20} />
				</div>
			</button>
			<div
				className={`absolute z-10 mt-2 transition-all duration-200 ease-in-out overflow-hidden ${
					visible ? "max-h-72" : "max-h-0"
				}`}
			>
				<div className="bg-white h-72 p-2 flex gap-2 flex-col shadow-xl rounded-md border border-solid border-gray-300">
					<div className="basis-1/12 border-b border-solid border-gray-500 flex items-center gap-2 py-1">
						<Search size={18} />
						<input
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							type="text"
							placeholder="Search"
							className="bg-transparent font-syne font-normal text-xl flex-grow rounded border-0 ring-0 focus:ring-0 outline-none"
						/>
					</div>
					<ul className="basis-10/12 overflow-auto">
						{filteredLanguages.map((language) => (
							<li
								key={language.code}
								onClick={() =>
									handleCheckboxChange(language)
								}
								className="cursor-pointer font-roboto-condensed font-normal text-base flex items-center justify-between py-2 border-b last:border-0"
							>
								<div className="flex items-center gap-2">
									<input
										type="checkbox"
                                        checked={selected.find(lng=>lng.code == language.code)!==undefined}
										onChange={(e) => handleCheckboxChange( language, e )}
										className="w-5 h-5 cursor-pointer"
									/>
									<CircleFlag
										countryCode={language.flag}
										className="h-5"
									/>
									<span>{language.name}</span>
								</div>
								<div>
									<span className="text-base font-roboto-condensed font-normal text-gray-500">
										{books.filter(book=> book.language == language.code).length}
									</span>
								</div>
							</li>
						))}
					</ul>
					<div className="basis-1/12 flex justify-between items-center gap-2">
						<button
							onClick={handleClearClick}
							className="px-4 py-2 flex justify-center items-center border border-black rounded font-syne text-base leading-[18px] font-normal transition-all duration-100 ease-in text-black bg-white cursor-pointer hover:bg-gray-100"
						>
							Clear
						</button>
						<button
							onClick={handleApplyClick}
							className="px-4 py-2 flex justify-center items-center border border-black rounded font-syne text-base leading-[18px] font-normal transition-all duration-100 ease-in text-white bg-black cursor-pointer hover:bg-gray-800"
						>
							Apply
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PortalLanguage;
