// src/CardList/index.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAnnotation, useCardList, useReader } from "../lib/hooks/useReaderContext";
import Card from "./Card";
import DDC from "@/data/categories";

const getType = (t: number = -1 ) => {
	if(t<0 || t> 100) return null;

	const type = DDC[t];
	return <React.Fragment>
		<img
			className="w-5 h-5 rounded-full float-left"
			src={`images/categories/${type.image}`}
		/>
		<span className="font-roboto-condensed text-sm font-bold">
			{type.type}
		</span>
	</React.Fragment>
};

// const getSubTypes = (subtypes: Array<number> = []) => {
// 	const subtypeTexts: Array<string> = [];

// 	// Iterate over each type
// 	Object.values(DDC).forEach((type) => {
// 		// Check each subtype in the category
// 		Object.entries(type.category).forEach(([key, value]) => {
// 			if (subtypes.includes(parseInt(key))) {
// 				subtypeTexts.push(value);
// 			}
// 		});
// 	});

// 	return subtypeTexts;
// };

export const CardList: React.FC = () => {
	const { showCardList, setShowCardList } = useCardList();

	const { annotations } = useAnnotation();
	const { metadata, coverUrl } = useReader();

	return (
		<div className="absolute inset-0 left-0 font-sans">
			{showCardList && (
				<div
					onClick={() => setShowCardList(false)}
					className="cursor-pointer absolute inset-0 bg-black opacity-50 z-10"
				></div>
			)}
			<div
				className={`flex flex-col gap-4 p-2 absolute top-0 right-0 w-[500px] h-full bg-indigo-50 shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${
					showCardList ? "-translate-x-0" : "translate-x-full"
				}`}
			>
				<div className="flex">
					{coverUrl && <img
							src={coverUrl}
							alt=""
							className="w-36 h-48 object-cover object-center"
						/>
					}
					{metadata && <div className="flex-grow flex flex-col justify-between p-2">
						<span className="font-roboto-condensed text-base font-normal">
							{metadata.creator }
						</span>
						<span className="font-syne text-xl font-semibold">
							{metadata.title}
						</span>
						<span className="font-roboto-condensed text-sm font-normal text-[#8E8E8E]">
							Non Fiction . {metadata.pubdate}
						</span>
						<div className="flex flex-wrap items-center gap-1">
							{getType(1)}
						</div>
						{/* <div className="flex justify-start flex-wrap item-center gap-2">
							{getSubTypes([8, 12]).map((subType) => (
								<div
									key={subType}
									className="truncate px-4 py-1 flex justify-center items-center border border-black rounded-full font-roboto-condensed text-xs font-normal cursor-pointer hover:bg-black hover:text-white transition-all duration-300 ease-in"
								>
									{subType}
								</div>
							))}
						</div> */}
					</div>}
				</div>

				<div className="flex flex-col overflow-auto gap-2">
					<span className="font-syne font-semibold text-xl">
						Cards {"(" + annotations.length + ")"}
					</span>
					{annotations.length === 0 ? (
						<div className="h-20 px-2 flex justify-center items-center">No Cards Available</div>
					) : (
						annotations?.map((item, i) => (
							<Card
								key={i}
								item={{
									id: i + "",
									cfi: item.selection.cfiRange,
									text: item.selection.text,
									title: "Sapiens",
									author_first: "Yuval",
									author_last: "Noah",
									fiction: true,
									type: 1,
									era: 1,
								}}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
};
