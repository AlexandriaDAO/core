import { setSelectedSearchedBook } from "@/features/home/homeSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useState } from "react";
import { BiBookAlt, BiPlus } from "react-icons/bi";
import { HiOutlinePlus } from "react-icons/hi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { SlEye, SlPlus } from "react-icons/sl";

// Assuming the structure of your item includes `id`, `title`, and `description`
interface Item {
	id: number;
	title: string;
	description: string;
	image: string;
}

interface Props {
	item: Item;
}

const Card: React.FC<Props> = ({ item }) => {
    const dispatch = useAppDispatch();
    const {selectedSearchedBook} =  useAppSelector(state=>state.home)

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


    const handleReadBookClick = ()=>{
        if(item.id == selectedSearchedBook?.id)
            dispatch(setSelectedSearchedBook(null))
        else
            dispatch(setSelectedSearchedBook(item))

    }
	return (
		<div
			className="p-4 text-black shadow-xl border border-solid rounded-lg bg-white transition-all duration-500 flex gap-1 flex-col justify-center items-stretch"
		>
			<div className="flex">
				<div
					className="basis-[180px] flex-shrink-0 h-64"
					style={{
						backgroundImage: `url(images/categories/${item.image})`,
					}}
				></div>
				<div className="flex-grow flex flex-col justify-between p-2 gap-2">
					<div className="flex justify-between">
						<div className="flex flex-col">
							<span className="font-roboto-condensed text-xl font-medium">
								ingo swann
							</span>
							<span className="font-syne text-2xl font-semibold">
								Penetration
							</span>
							<span className="font-roboto-condensed text-sm font-normal text-[#8E8E8E]">
								Non Fiction 2011
							</span>
							<div className="flex flex-wrap items-center gap-2">
								<div className="flex justify-start flex-wrap item-center gap-2">
									{["RELIGION", "GENERALITIES AND IT"].map(
										(category, index, arr) => (
											<React.Fragment key={category}>
												<span className="font-roboto-condensed text-sm font-bold">
													{category}
												</span>
												{index < arr.length - 1 && ( // Only add a dot if it's not the last item
													<span className="font-roboto-condensed text-sm font-bold">
														.
													</span>
												)}
											</React.Fragment>
										)
									)}
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
						{[
							"Metaphysics",
							"Natural Theology",
							"Fossils & prehistoric life",
							"Classical and modern Greek literatures",
						].map((subCategory) => (
							<div className="truncate px-4 py-1 flex justify-center items-center border border-black rounded-full font-roboto-condensed text-sm font-normal cursor-pointer hover:bg-black hover:text-white transition-all duration-300 ease-in">
								{subCategory}
							</div>
						))}
					</div>
				</div>
			</div>
            <div className="text-[#8E8E8E] flex justify-start items-center font-roboto-condensed text-sm font-normal gap-2 ">
                <SlPlus
                    size={20}
                />
                <span> 102 </span>
                <SlEye
                    size={20}
                />
                <span> 1,2k</span>
            </div>
			<div>
				<p className="font-roboto-condensed font-normal text-xl ">
					{expanded
						? item.description
						: truncateText(item.description, 100)}
				</p>
                {item.description.length > 100 && (
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
