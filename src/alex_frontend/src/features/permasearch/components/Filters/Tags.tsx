import React from "react";
import { X } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import {
	addFilterTag,
	removeFilterTag,
} from "../../store/slice";

const APP_NAME_OPTIONS = [
	"ArDrive-Desktop",
	"ArDrive-Web", 
	"ArConnect",
	"Akord",
	"everPay",
];

export const FilterTags: React.FC = () => {
	const dispatch = useAppDispatch();
	const { filters } = useAppSelector(state => state.permasearch);

	const handleCustomTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			const name = e.currentTarget.value.trim();
			const valueInput = e.currentTarget.parentElement?.querySelector(
				'input[placeholder="Tag value"]'
			) as HTMLInputElement;
			const value = valueInput?.value.trim();
			if (name && value) {
				dispatch(addFilterTag({ name, value }));
				e.currentTarget.value = "";
				valueInput.value = "";
			}
		}
	};

	const handleCustomTagValueKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			const value = e.currentTarget.value.trim();
			const nameInput = e.currentTarget.parentElement?.querySelector(
				'input[placeholder="Tag name"]'
			) as HTMLInputElement;
			const name = nameInput?.value.trim();
			if (name && value) {
				dispatch(addFilterTag({ name, value }));
				e.currentTarget.value = "";
				nameInput.value = "";
			}
		}
	};

	return (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
				Tags
			</h4>

			{/* App-Name Tags */}
			<div className="h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
				<div className="p-3 space-y-3">
					<div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
						App-Name
					</div>
					<div className="flex flex-wrap gap-1">
						{APP_NAME_OPTIONS.map((value) => {
							const isSelected = filters.tags.some(
								(tag: { name: string; value: string }) =>
									tag.name === "App-Name" && tag.value === value
							);
							return (
								<button
									key={value}
									onClick={() => {
										if (isSelected) {
											dispatch(
												removeFilterTag({
													name: "App-Name",
													value,
												})
											);
										} else {
											dispatch(
												addFilterTag({
													name: "App-Name",
													value,
												})
											);
										}
									}}
									className={`px-2 py-1 text-xs rounded transition-colors border ${
										isSelected
											? "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700"
											: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"
									}`}
									title={
										isSelected
											? `Remove App-Name: ${value}`
											: `Add App-Name: ${value}`
									}
								>
									{value}
								</button>
							);
						})}
					</div>

					{/* Custom Tags Display */}
					{filters.tags.filter(
						(tag: { name: string; value: string }) => tag.name !== "App-Name"
					).length > 0 && (
						<div className="space-y-2">
							<div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
								Custom Tags
							</div>
							<div className="flex flex-wrap gap-1">
								{filters.tags
									.filter(
										(tag: { name: string; value: string }) =>
											tag.name !== "App-Name"
									)
									.map((tag: { name: string; value: string }, index: number) => (
										<div
											key={index}
											className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded"
											title={`${tag.name}: ${tag.value}`}
										>
											<span className="font-medium">{tag.name}:</span>
											<span>{tag.value}</span>
											<button
												onClick={() => dispatch(removeFilterTag(tag))}
												className="ml-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200"
											>
												<X className="h-3 w-3" />
											</button>
										</div>
									))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Custom Tag Input */}
			<div className="flex flex-col justify-start">
				<label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
					Custom Tag{" "}
					<span className="text-xs normal-case text-gray-500">
						(press enter to add)
					</span>
				</label>
				<div className="grid grid-cols-2 gap-2">
					<input
						type="text"
						placeholder="Tag name"
						className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 dark:bg-gray-800 dark:text-white placeholder-gray-400"
						onKeyDown={handleCustomTagKeyDown}
					/>
					<input
						type="text"
						placeholder="Tag value"
						className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 dark:bg-gray-800 dark:text-white placeholder-gray-400"
						onKeyDown={handleCustomTagValueKeyDown}
					/>
				</div>
			</div>
		</div>
	);
};