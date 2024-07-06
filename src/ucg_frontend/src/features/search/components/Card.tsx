import { setSelectedSearchedBook } from "@/features/home/homeSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useState } from "react";
import { BiBookAlt, BiPlus } from "react-icons/bi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { SlEye, SlPlus } from "react-icons/sl";
import { getSubTypes, getTypes } from "../utils/properties";

// Assuming the structure of your item includes `id`, `title`, and `description`
export interface BookCardItem {
	id: string;
	cfi: string;
	text: string;
	title: string;
	author: string;
	fiction: boolean;
	type: Array<number>;
	subtype: Array<number>;
	pubyear: number;
	asset_id: string;
	_formatted: BookCardItem
}

interface Props {
	item: BookCardItem;
}

const Card: React.FC<Props> = ({ item }) => {
	const dispatch = useAppDispatch();
	const { selectedSearchedBook } = useAppSelector((state) => state.home);

	const [expanded, setExpanded] = useState(false);

	// Function to truncate the description
	const truncateText = (text: string, maxLength: number): string => {
		if (text.length > maxLength) {
			return `${text.substring(0, maxLength)}...`;
		}
		return text;
	};

	// Toggle expanded state
	const toggleExpand = () => {
		setExpanded(!expanded);
	};

	const handleReadBookClick = () => {
		if (item.id == selectedSearchedBook?.id)
			dispatch(setSelectedSearchedBook(null));
		else dispatch(setSelectedSearchedBook(item));
	};

	return (
		<div className="p-4 text-black shadow-xl border border-solid rounded-lg bg-white transition-all duration-500 flex gap-1 flex-col justify-center items-stretch">
			<div className="flex">
				<div
					className="basis-[180px] flex-shrink-0 min-h-64 h-full bg-no-repeat bg-cover"
					style={{
						// backgroundImage: `url(images/categories/${item.image})`,
						backgroundImage: `url(https://picsum.photos/300/100)`,
					}}
				></div>
				<div className="flex-grow flex flex-col justify-between p-2 gap-x-2 gap-y-1">
					<div className="flex justify-between">
						<div className="flex flex-col">
							<span className="font-roboto-condensed text-xl font-medium">
								{item.author}
							</span>
							<span className="font-syne text-xl font-semibold" dangerouslySetInnerHTML={{ __html: item._formatted.title}}></span>
							<span className="font-roboto-condensed text-sm font-normal text-[#8E8E8E]">
								{item.fiction ? "Fiction" : "Non Fiction"}{" "}
								&nbsp; {item.pubyear ? item.pubyear : ""}
							</span>
							<div className="flex flex-wrap items-center gap-2">
								<div className="flex justify-start flex-wrap item-center gap-2">
									{getTypes(item.type).map(({ type }, index, arr)=>(
										<React.Fragment key={type}>
											<span className="font-roboto-condensed text-sm font-bold">
												{type}
											</span>
											{index < arr.length - 1 && ( // Only add a dot if it's not the last item
												<span className="font-roboto-condensed text-sm font-bold">
													.
												</span>
											)}
										</React.Fragment>
									))}
								</div>
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<BiBookAlt
								size={38}
								onClick={handleReadBookClick}
								className="p-2 text-white border border-solid bg-black rounded-full cursor-pointer duration-300 transition-all hover:bg-white hover:border-black hover:text-black "
							/>
							<BiPlus
								size={36}
								className="p-2 border border-solid border-black rounded-full"
							/>
						</div>
					</div>
					<div className="flex justify-start flex-wrap item-center gap-2">
						{getSubTypes(item.subtype).map((subType) => (
							<div
								key={subType}
								className="truncate px-4 py-1 flex justify-center items-center border border-black rounded-full font-roboto-condensed text-sm font-normal cursor-pointer hover:bg-black hover:text-white transition-all duration-300 ease-in"
							>
								{subType}
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="text-[#8E8E8E] flex justify-start items-center font-roboto-condensed text-sm font-normal gap-2 ">
				<SlPlus size={20} />
				<span> 102 </span>
				<SlEye size={20} />
				<span> 1,2k</span>
			</div>
			<div>
				<p className="font-roboto-condensed font-normal text-xl" dangerouslySetInnerHTML={{ __html: expanded ? item._formatted.text : truncateText(item._formatted.text, 200)}}></p>
				{item.text.length > 100 && (
					<div
						className="cursor-pointer hover:text-gray-500 font-roboto-condensed text-xl font-medium flex justify-center items-center"
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
