import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const categories = [
	{
		key: 1,
		title: "Generalities And IT",
		image: "generalities-and-it.png",
		books: 2014,
	},
	{ key: 2, title: "Philosophy", image: "philosophy.png", books: 519 },
	{ key: 3, title: "Religion", image: "religion.png", books: 1300 },
	{
		key: 4,
		title: "Social Sciences",
		image: "social-sciences.png",
		books: 2014,
	},
	{ key: 5, title: "Language", image: "language.png", books: 405 },
	{ key: 6, title: "Science", image: "science.png", books: 780 },
	{ key: 7, title: "Technology", image: "technology.png", books: 1900 },
	{
		key: 8,
		title: "Art and Recreation",
		image: "art-and-recreation.png",
		books: 3400,
	},
	{ key: 9, title: "Literature", image: "literature.png", books: 4750 },
	{
		key: 10,
		title: "History and Geography",
		image: "history-and-geography.png",
		books: 2713,
	},
];

function Filter() {
	const dispatch = useAppDispatch();
	const { filter } = useAppSelector((state) => state.home);

	return (
		<div className="flex-grow flex flex-col gap-4 py-4 transition-all duration-200 ease-in">
			<div className=" grid grid-cols-10 h-32 text-white font-syne font-normal text-xl">
				{categories.map((category) => (
					<div
						key={category.key}
						className={`p-2 text-center cursor-pointer bg-cover bg-center flex flex-col justify-between items-stretch relative`}
						style={{
							backgroundImage: `url(images/categories/${category.image})`,
						}}
					>
                        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
						<span className="text-left z-20">{category.title}</span>
						<input
							type="radio"
                            defaultChecked={category.title == 'Language'}
							className="z-20 cursor-pointer self-end h-7 w-7 p-1 border border-white text-white focus:ring-white "
						/>
					</div>
				))}
			</div>
			<div className="flex justify-start flex-wrap item-center gap-2 text-white">
				{[
					"Linguistics",
					"Writing systems",
					"English & Old English languages",
					"German & related languages",
					"French & related languages",
					"Italian, Romanian & related languages",
					"Spanish, Portuguese, Galician",
					"Latin & Italic languages",
					"Classical Greek",
					"Other languages",
				].map((subCategory) => (
					<div className="px-5 py-3 flex justify-center items-center border border-white rounded-full font-roboto-condensed text-base leading-[18px] font-medium cursor-pointer hover:bg-black hover:border-black transition-all duration-300 ease-in">{subCategory}</div>
				))}
			</div>
		</div>
	);
}

export default Filter;
