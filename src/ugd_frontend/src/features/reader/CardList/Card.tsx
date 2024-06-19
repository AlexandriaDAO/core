import DDC from "@/data/categories";
import React, { useState } from "react";
import { BiBookAlt, BiMinus, BiPlus } from "react-icons/bi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useAnnotation, useCardList, useReader } from "../lib/hooks/useReaderContext";

// Assuming the structure of your item includes `id`, `title`, and `description`
interface Item {
	id: string;
	cfi: string;
	text: string;
	title: string;
	author: string;
	fiction: boolean;
	type: Array<number>;
	subtype: Array<number>;
	pubyear: number;
}

interface Props {
	item: Item;
}

const Card: React.FC<Props> = ({ item }) => {
	const { rendition } = useReader();
	const { removeAnnotation } = useAnnotation();
	const { setShowCardList } = useCardList();
	const [expanded, setExpanded] = useState(false);

	// Toggle expanded state
	const toggleExpand = () => {
		setExpanded(!expanded);
	};

	// Function to truncate the description
	const truncateText = (text: string, maxLength: number): string => {
		if (text.length > maxLength) {
			return `${text.substring(0, maxLength)}...`;
		}
		return text;
	};

	const getTypes = () => {
		const types = item.type
			.map((type) => DDC[type])
			.filter((type) => type !== undefined);
		console.log(types);
		return types.map(({ type, image }, index, arr) => (
			<React.Fragment key={type}>
				<img className="w-5 h-5 rounded-full float-left" src={`images/categories/${image}`}/>
				<span className="font-roboto-condensed text-sm font-bold">{type}</span>
			</React.Fragment>
		));
	};

	const getSubTypes = () => {
		const subtypeTexts:Array<string> = [];

		// Iterate over each type
		Object.values(DDC).forEach(type => {
			// Check each subtype in the category
			Object.entries(type.category).forEach(([key, value]) => {
			if (item.subtype.includes(parseInt(key))) {
				subtypeTexts.push(value);
			}
			});
		});

		return subtypeTexts;
	}

	function handleNavigateCard() {
		rendition.current && rendition.current.display(item.cfi);

		setShowCardList(false);
	}

	function handleRemoveCard() {
		rendition.current && rendition.current.annotations.remove(item.cfi, "highlight");
		removeAnnotation(item.cfi);
	}

	return (
		<div className="p-3 text-black shadow-xl border border-solid rounded-lg bg-white transition-all duration-500 flex gap-1 flex-col justify-center items-stretch">
			<div className="flex">
				{/* <div
					className="basis-14 flex-shrink-0 min-h-20 h-full bg-no-repeat bg-cover"
					style={{
						// backgroundImage: `url(images/categories/${item.image})`,
						backgroundImage: `url(https://picsum.photos/300/100)`,
					}}
				></div> */}
				<img src="https://picsum.photos/300/100" alt="" className="w-16 object-cover object-center" />
				<div className="flex-grow flex justify-between gap-1">
					<div className="px-1 flex-grow flex flex-col justify-between">
						<span className="font-roboto-condensed text-base font-normal">
							{item.author}
						</span>
						<span className="font-syne text-xl font-semibold">{item.title}</span>
						<div className="flex flex-wrap items-center gap-1">
							{getTypes()}
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<BiBookAlt
							size={38}
							onClick={handleNavigateCard}
							className="p-2 text-white border border-solid bg-black rounded-full cursor-pointer duration-300 transition-all hover:bg-white hover:border-black hover:text-black "
						/>
						<BiMinus
							onClick={handleRemoveCard}
							size={36}
							className="p-2 border border-solid border-black rounded-full cursor-pointer duration-300 transition-all hover:bg-black hover:border-white hover:text-white "
						/>
					</div>
				</div>
			</div>
			<div className="flex justify-start flex-wrap item-center gap-2">
				{getSubTypes().map((subType) => (
					<div
						key={subType}
						className="truncate px-4 py-1 flex justify-center items-center border border-black rounded-full font-roboto-condensed text-xs font-normal cursor-pointer hover:bg-black hover:text-white transition-all duration-300 ease-in"
					>
						{subType}
					</div>
				))}
			</div>

			<div>
				<p className="font-roboto-condensed font-normal text-base">{expanded ? item.text : truncateText(item.text, 200)}</p>
				{item.text.length > 100 && (
					<div
						className="mt-1 cursor-pointer hover:text-gray-500 font-roboto-condensed text-sm font-medium flex justify-center items-center"
						onClick={toggleExpand}
					>
						{expanded ? (
							<span> Show Less</span>
						) : (
							<span>Show More </span>
						)}

						{expanded ? <IoIosArrowUp /> : <IoIosArrowDown />}
					</div>
				)}
			</div>
		</div>
	);
};

export default Card;
