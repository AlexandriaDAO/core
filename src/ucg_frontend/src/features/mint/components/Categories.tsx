import DDC from "@/data/categories";
import React from "react";
import { setNewBook } from "../mintSlice";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

const Categories: React.FC = () => {
	const dispatch = useAppDispatch();
	const { newBook } = useAppSelector((state) => state.mint);


	const handleCategoryChange = (
		event: React.ChangeEvent<HTMLSelectElement>
	) => {
		const category = parseInt(event.target.value, 10);
		if ( newBook.categories.length >= 5 ){
			alert('You can only select upto 5 categories')
			return;
		}

		if (newBook.categories.includes(category)){
			alert('That category is already selected')
			return;
		}

		const categories = [...newBook.categories, category];
		dispatch(setNewBook({ ...newBook, categories }));
	};

	return (
		<div className="flex flex-col w-full items-stretch font-roboto-condensed text-black">
			<label className="text-base font-medium">Categories</label>
			<select
				className="w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-sm font-normal"
				onChange={handleCategoryChange}
			>
				<option value="">Select Categories</option>
				{Object.entries(DDC[newBook.book_type]?.category || {}).map(
					([key, value]) => (
						<option key={key} value={key}>
							{value}
						</option>
					)
				)}
			</select>
		</div>
	);
};

export default Categories;
