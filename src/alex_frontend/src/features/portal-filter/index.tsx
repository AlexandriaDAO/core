import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect, useRef } from "react";
import {
	setCategories,
	setLanguages,
	setTypes,
	setVisible,
	setEras,
} from "./portalFilterSlice";
import { CircleFlag } from "react-circle-flags";
import { TypeInterface } from "../portal-type/utils/type";
import { Language } from "../portal-language/portalLanguageSlice";
import { CategoryInterface } from "../portal-category/utils/category";
import { Era } from "@/data/eras";
import { X } from "lucide-react";

function PortalFilter() {
	const dispatch = useAppDispatch();
	const { types, languages, categories, eras, visible } = useAppSelector(
		(state) => state.portalFilter
	);
	const dropdownRef = useRef<HTMLDivElement>(null);

	function handleClick() {
		dispatch(setVisible(!visible));
	}

	const handleClearClick = () => {
		dispatch(setTypes([]));
		dispatch(setLanguages([]));
		dispatch(setCategories([]));
		dispatch(setEras([]));
	};

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

	const filtersCount = () =>
		types.length + languages.length + categories.length + eras.length;

	function handleRemoveType(type: TypeInterface): void {
		dispatch(setTypes(types.filter((t) => t.id !== type.id)));
	}

	function handleRemoveLanguage(language: Language): void {
		dispatch(
			setLanguages(languages.filter((lng) => lng.code !== language.code))
		);
	}

	function handleRemoveCategory(category: CategoryInterface): void {
		dispatch(setCategories(categories.filter((t) => t.id !== category.id)));
	}

	function handleRemoveEra(era: Era): void {
		dispatch(
			setEras(
				eras.filter( (er) => !( er.value== era.value))
			)
		);
	}

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={handleClick}
				className="font-roboto-condensed font-medium text-[#F9B530] text-xl"
			>
				Applied Filters {`(${filtersCount()})`}
			</button>
			<div
				className={`absolute z-10 mt-2 transition-all duration-200 ease-in-out overflow-hidden ${
					visible ? "max-h-72" : "max-h-0"
				}`}
			>
				<div className="bg-white h-72 w-[30rem] p-4 flex gap-2 flex-col shadow-xl rounded-md border border-solid border-gray-300">
					{filtersCount() > 0 ? (
						<>
							<div className="basis-11/12 flex gap-2 flex-col flex-grow-0 overflow-auto">
								{types.length > 0 && (
									<div className="flex flex-col gap-2">
										<span className="font-roboto-condensed font-normal text-xl">
											Type
										</span>
										<div className="flex flex-wrap gap-2">
											{types.map((type) => (
												<div
													key={type.id}
													className="flex items-center justify-between gap-2 border border-solid border-black px-2 py-1 rounded-full"
												>
													<span className="text-base">{type.title}</span>
													<X
														onClick={() =>
															handleRemoveType(
																type
															)
														}
														className="cursor-pointer"
														size={20}
													/>
												</div>
											))}
										</div>
									</div>
								)}
								{languages.length > 0 && (
									<div className="flex flex-col gap-2">
										<span className="font-roboto-condensed font-normal text-xl">
											Language
										</span>
										<div className="flex flex-wrap gap-2">
											{languages.map((language) => (
												<div
													key={language.code}
													className="flex items-center justify-between gap-2 border border-solid border-black px-2 py-1 rounded-full"
												>
													<CircleFlag
														countryCode={
															language.flag
														}
														className="h-5"
													/>
													<span className="text-base">{language.name}</span>
													<X
														onClick={() =>
															handleRemoveLanguage(
																language
															)
														}
														className="cursor-pointer"
													/>
												</div>
											))}
										</div>
									</div>
								)}

								{categories.length > 0 && (
									<div className="flex flex-col gap-2">
										<span className="font-roboto-condensed font-normal text-xl">
											Category
										</span>
										<div className="flex flex-wrap gap-2">
											{categories.map((category) => (
												<div
													key={category.id}
													className="flex items-center justify-between gap-2 border border-solid border-black px-2 py-1 rounded-full"
												>
													<span className="text-base">
														{category.title}
													</span>
													<X
														onClick={() =>
															handleRemoveCategory(
																category
															)
														}
														className="cursor-pointer"
													/>
												</div>
											))}
										</div>
									</div>
								)}

								{eras.length > 0 && (
									<div className="flex flex-col gap-2">
										<span className="font-roboto-condensed font-normal text-xl">
											Publication Era
										</span>
										<div className="flex flex-wrap gap-2">
											{eras.map(era => (
												<div
													key={era.value}
													className="flex items-center justify-between gap-2 border border-solid border-black px-2 py-1 rounded-full"
												>
													<span className="text-base">
														{era.label}
													</span>
													<X
														onClick={() =>
															handleRemoveEra(
																era
															)
														}
														className="cursor-pointer"
													/>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
							<div className="basis-1/12 flex justify-center items-center gap-2 border-b border-solid border-black">
								<button
									onClick={handleClearClick}
									className="px-4 py-2 flex justify-center items-center rounded font-roboto-condensed font-bold text-xl leading-[18px] transition-all duration-100 ease-in text-black bg-white cursor-pointer hover:text-700"
								>
									Delete All
								</button>
							</div>
						</>
					) : (
						<span className="font-roboto-condensed font-normal text-base">
							No Results to show
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

export default PortalFilter;
