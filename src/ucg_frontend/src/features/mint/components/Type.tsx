import DDC from "@/data/categories";
import React from "react";
import { setNewBook } from "../mintSlice";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

const Type: React.FC = () => {
	const dispatch = useAppDispatch();
	const { newBook } = useAppSelector((state) => state.mint);

	// const updateMetadataForCategories = (newBook.categories: number[]) => {
	// 	const uniqueMainCategories = Array.from(new Set(newBook.categories.map(category => Math.floor(category / 10))));
	// 	const types = `[${uniqueMainCategories.join(', ')}]`;
	// 	const subtypes = `[${newBook.categories.join(', ')}]`;
	// 	dispatch(setNewBook({ ...newBook, type: types, subtype: subtypes }));
	// };

	const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const value = parseInt(event.target.value, 10);
		dispatch(setNewBook({ ...newBook, book_type: value }));
	};

	return (
		<div className="flex flex-col w-full items-stretch font-roboto-condensed text-black">
			<label className="text-base font-medium">Type</label>
			<select
				className="w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-sm font-normal"
				onChange={handleTypeChange}
				value={newBook.book_type || ""}
			>
				<option value="">Select a Type</option>
				{Object.entries(DDC).map(([key, value]) => (
					<option key={key} value={key}>
						{value.type}
					</option>
				))}
			</select>
		</div>
	);
};

export default Type;
