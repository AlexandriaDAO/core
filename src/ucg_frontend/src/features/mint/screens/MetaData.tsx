// MetaData.tsx
import React, { ChangeEvent, useEffect, useState } from "react";
import languages from "@/data/languages";
import CategorySelect from "../components/Type";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setNewBook } from "../mintSlice";
import { BiMinus, BiPlus } from "react-icons/bi";
import { Slider, Switch } from "antd";
import Type from "../components/Type";
import Categories from "../components/Categories";
import SelectedCategories from "../components/SelectedCategories";

const MetaData = () => {
	const dispatch = useAppDispatch();
	const { newBook } = useAppSelector((state) => state.mint);

	const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		dispatch(setNewBook({ ...newBook, language: e.target.value }));
	};

	const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
		const year = parseInt(event.target.value, 10);
		if (isNaN(year) || year < -6000 || year > 2050) return;

		dispatch(setNewBook({ ...newBook, pubyear: year }));
	};

	function handleIncrementPubYear() {
		if (newBook.pubyear >= 2050) return;

		dispatch(setNewBook({ ...newBook, pubyear: newBook.pubyear + 1 }));
	}

	function handleDecrementPubYear() {
		console.log(newBook.pubyear);
		if (newBook.pubyear < -6000) return;

		dispatch(setNewBook({ ...newBook, pubyear: newBook.pubyear - 1 }));
	}
	useEffect(()=>{
		console.log(newBook);
	},[])
	return (
		<section className="flex-grow h-full overflow-auto p-4 w-full flex flex-col gap-2 items-start justify-start">
			<div className="flex flex-col w-full items-stretch font-roboto-condensed text-black">
				<label className="text-base font-medium" htmlFor="title">
					Title
				</label>

				<input
					className="w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-sm font-normal"
					type="text"
					id="title"
					placeholder="Book Title"
					value={newBook.title}
					onChange={(e) =>
						dispatch(
							setNewBook({
								...newBook,
								title: e.target.value,
							})
						)
					}
				/>
			</div>
			<div className="flex flex-col w-full items-stretch font-roboto-condensed text-black">
				<label className="text-base font-medium" htmlFor="author">
					Author
				</label>

				<input
					className="w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-sm font-normal"
					type="text"
					id="author"
					placeholder="Author"
					value={newBook.author}
					onChange={(e) =>
						dispatch(
							setNewBook({
								...newBook,
								author: e.target.value,
							})
						)
					}
				/>
			</div>

			<div className="flex flex-col w-full items-stretch font-roboto-condensed text-black">
				<label className="text-base font-medium" htmlFor="description">
					Description
				</label>

				<textarea
					onChange={(e) =>
						dispatch(
							setNewBook({
								...newBook,
								description: e.target.value,
							})
						)
					}
					className="w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-sm font-normal"
					name="description"
					id="description"
					placeholder="Description"
				></textarea>
			</div>

			<div className="flex flex-col gap-1 pb-2 w-full items-stretch font-roboto-condensed text-black">
				<label className="text-base font-medium" htmlFor="fiction">
					Fiction
				</label>
				<div className="flex justify-start items-center">
					<Switch
						checked={newBook.fiction}
						onChange={(e) =>
							dispatch(
								setNewBook({
									...newBook,
									fiction: !newBook.fiction,
								})
							)
						}
					/>
					<span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
						This is a {newBook.fiction ? "Fiction" : "Non-Fiction"} book.
					</span>
				</div>
			</div>

			<Type />
			{newBook.book_type !== -1 && <Categories />}
			{newBook.categories.length>0 && <SelectedCategories />}

			<div className="flex flex-col w-full items-stretch font-roboto-condensed text-black">
				<label className="text-base font-medium" htmlFor="pubyear">
					Publication Year
				</label>

				<div className="flex justify-between items-center gap-2">
					<BiMinus
						onClick={handleDecrementPubYear}
						size={22}
						className={`p-1 border border-solid border-black rounded-full duration-300 transition-all ${
							newBook.pubyear < -6000
								? "opacity-50 cursor-not-allowed"
								: "cursor-pointer hover:bg-black hover:border-white hover:text-white"
						}`}
					/>
					<input
						className="w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-sm font-normal"
						type="number"
						id="pubyear"
						placeholder="Year (e.g., 2022 or -500)"
						min="-6000"
						max="2050"
						step="1"
						value={newBook.pubyear}
						onChange={handleOnChange}
					/>
					<BiPlus
						onClick={handleIncrementPubYear}
						size={22}
						className={`p-1 border border-solid border-black rounded-full duration-300 transition-all ${
							newBook.pubyear >= 2050
								? "opacity-50 cursor-not-allowed"
								: "cursor-pointer hover:bg-black hover:border-white hover:text-white"
						}`}
					/>
				</div>
				<small className="text-gray-600">
					Note: Enter negative years for BC (e.g., -500 for 500 BC).
				</small>
			</div>

			<div className="flex flex-col w-full items-stretch font-roboto-condensed text-black">
				<label htmlFor="language" className="text-base font-medium">
					Language
				</label>
				<select
					id="language"
					value={newBook.language || "en"}
					onChange={handleLanguageChange}
					className="w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-sm font-normal"
				>
					{languages.map((lang) => (
						<option key={lang.code} value={lang.code}>
							{lang.name}
						</option>
					))}
				</select>
			</div>

			{/*these one's are optional fields. */}

			<div className="flex flex-col w-full items-stretch font-roboto-condensed text-black">
				<label htmlFor="publisher" className="text-base font-medium">
					Publisher
				</label>
				<input
					className="w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-sm font-normal"
					type="text"
					id="publisher"
					placeholder="Publisher"
					value={newBook?.publisher}
					onChange={(e) =>
						setNewBook({
							...newBook,
							publisher: e.target.value,
						})
					}
				/>
			</div>

			<div className="flex flex-col w-full items-stretch font-roboto-condensed text-black">
				<label htmlFor="rights" className="text-base font-medium">
					Rights
				</label>
				<input
					className="w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-sm font-normal"
					type="text"
					id="rights"
					placeholder="Additional details regarding publication rights"
					value={newBook?.rights}
					onChange={(e) =>
						setNewBook({
							...newBook,
							rights: e.target.value,
						})
					}
				/>
			</div>

			<div className="flex flex-col w-full items-stretch font-roboto-condensed text-black">
				<label htmlFor="isbn" className="text-base font-medium">
					ISBN
				</label>
				<input
					className="w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-sm font-normal"
					type="text"
					id="isbn"
					placeholder="ISBN"
					value={newBook?.isbn}
					onChange={(e) =>
						setNewBook({
							...newBook,
							isbn: e.target.value,
						})
					}
				/>
			</div>
		</section>
	);
};

export default MetaData;
