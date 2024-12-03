import DDC from "@/data/categories";
import eras from "@/data/eras";
import { Label } from "@/lib/components/label";
import React, { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { updateMetadata } from "../uploadBookSlice";

const CategorySelect: React.FC = () => {
	const dispatch = useAppDispatch();
	const metadata = useAppSelector((state) => state.uploadBook.metadata);

	const [selectedMainCategory, setSelectedMainCategory] =
		useState<number>(-1);
	const [selectedSubcategories, setSelectedSubcategories] = useState<
		number[]
	>([]);
	const [errors, setErrors] = useState<{
		category?: string;
		subcategories?: string;
		era?: string;
	}>({});

	useEffect(() => {
		// Initialize from Redux state instead of props
		if (metadata.type !== undefined) {
			setSelectedMainCategory(metadata.type);
		}

		if (Array.isArray(metadata.categories)) {
			setSelectedSubcategories(metadata.categories);
		} else {
			setSelectedSubcategories([]);
		}
	}, []);

	useEffect(() => {
		updateMetadataInRedux();
		validateFields();
	}, [selectedMainCategory, selectedSubcategories, metadata.era]);

	const updateMetadataInRedux = () => {
		if (selectedMainCategory >= 0) {
			dispatch(
				updateMetadata({
					type: selectedMainCategory,
					categories: selectedSubcategories,
				})
			);
		}
	};

	const validateFields = () => {
		const newErrors: {
			category?: string;
			subcategories?: string;
			era?: string;
		} = {};

		if (selectedMainCategory < 0) {
			newErrors.category = "Please select a main category";
		}

		if (selectedSubcategories.length !== 3) {
			newErrors.subcategories = "Please select exactly 3 subcategories";
		}

		if (!metadata.era) {
			newErrors.era = "Please select an era";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleMainCategoryChange = (
		event: React.ChangeEvent<HTMLSelectElement>
	) => {
		const value = parseInt(event.target.value, 10);
		setSelectedMainCategory(value);
		setSelectedSubcategories([]);
	};

	const handleSubcategoryChange = (subcategory: number) => {
		if (selectedSubcategories.includes(subcategory)) {
			setSelectedSubcategories(
				selectedSubcategories.filter((sc) => sc !== subcategory)
			);
		} else if (selectedSubcategories.length < 3) {
			setSelectedSubcategories([...selectedSubcategories, subcategory]);
		} else {
			alert("You must select exactly 3 subcategories.");
		}
	};

	const handleEraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = parseInt(e.target.value, 10);
		dispatch(updateMetadata({ era: value }));
	};

	return (
		<>
			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<Label
					htmlFor="type"
					scale="md"
					variant={metadata.type < 0 ? "destructive" : "default"}
				>
					Type
				</Label>
				<select
					onChange={handleMainCategoryChange}
					value={selectedMainCategory}
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
					id="type"
				>
					<option value="-1">Select a Category</option>
					{Object.entries(DDC).map(([key, value]) => (
						<option key={key} value={key}>
							{value.type}
						</option>
					))}
				</select>
				{errors.category && (
					<p style={{ color: "red" }}>{errors.category}</p>
				)}
			</div>

			{selectedMainCategory >= 0 && (
				<div>
					<Label
						scale="md"
						variant={
							errors.subcategories ? "destructive" : "default"
						}
					>
						Subtypes (Select exactly 3)
					</Label>
					{Object.entries(
						DDC[selectedMainCategory]?.category || {}
					).map(([key, value]) => (
						<div key={key} style={{ marginBottom: "5px" }}>
							<input
								type="checkbox"
								id={`subtype-${key}`}
								checked={selectedSubcategories.includes(
									parseInt(key, 10)
								)}
								onChange={() =>
									handleSubcategoryChange(parseInt(key, 10))
								}
								disabled={
									selectedSubcategories.length >= 3 &&
									!selectedSubcategories.includes(
										parseInt(key, 10)
									)
								}
							/>
							<label
								htmlFor={`subtype-${key}`}
								style={{ marginLeft: "5px" }}
							>
								{value}
							</label>
						</div>
					))}
					{errors.subcategories && (
						<p style={{ color: "red" }}>{errors.subcategories}</p>
					)}
				</div>
			)}

			{selectedSubcategories && selectedSubcategories.length > 0 && (
				<div>
					<strong>Selected Subcategories:</strong>
					<ul>
						{selectedSubcategories.map((subcat) => (
							<li key={subcat}>
								{DDC[selectedMainCategory]?.category[subcat]}
							</li>
						))}
					</ul>
				</div>
			)}

			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<Label
					htmlFor="era"
					scale="md"
					variant={errors.era ? "destructive" : "default"}
				>
					Historical Era
				</Label>
				<select
					id="era"
					value={metadata.era || ""}
					onChange={handleEraChange}
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
				>
					<option value="">Select an Era</option>
					{eras.map((era) => (
						<option key={era.value} value={era.value}>
							{era.label}
						</option>
					))}
				</select>
				{errors.era && <p style={{ color: "red" }}>{errors.era}</p>}
			</div>
		</>
	);
};

export default CategorySelect;
