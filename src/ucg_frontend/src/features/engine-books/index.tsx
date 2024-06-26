import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp, IoIosSearch } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import BookUpload from "./components/BookUpload";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const EngineBooks = () => {
	const [expanded, setExpanded] = useState(false);
	const { user } = useAppSelector((state) => state.auth);
	const { activeEngine } = useAppSelector((state) => state.engineOverview);
	return (
		<div className="bg-white rounded-lg">
			{/* <div className="flex justify-between items-center p-4 border-b border-solid border-black">
				<span className="font-roboto-condensed font-bold text-xl leading-6 text-black">
					Manage Books {"(29)"}
				</span>
				<span className="font-roboto-condensed text-base leading-[18px] text-gray-500">
					Clear All
				</span>
			</div> */}
			<div className="flex flex-col gap-2">
				{user == activeEngine?.owner && (
					<>
						<span className="font-roboto-condensed text-base leading-[18px] text-black font-normal">
							Add Book
						</span>
						<div className="flex justify-between items-center gap-4">
							<div className="flex-grow border border-solid border-gray-500 rounded-full flex items-center gap-2 px-4 py-2">
								<IoIosSearch />
								<input
									type="text"
									placeholder="Search"
									className="font-roboto-condensed font-normal text-base flex-grow rounded border-0 ring-0 focus:ring-0 outline-none"
								/>
							</div>
							<BookUpload />
						</div>
					</>
				)}
				<span className="font-roboto-condensed text-base leading-[18px] text-black font-normal">
					Added Books
				</span>
				<div
					className={`flex flex-col gap-2 ${
						expanded ? "h-auto" : "max-h-96 overflow-auto"
					}`}
				>
					<div className="flex justify-between gap-2 items-stretch text-black bg-[#F4F4F4] rounded-lg p-2">
						<img
							className="rounded-lg h-12 w-12 object-fill"
							src={`images/books/sapiens.png`}
						/>
						<div className="flex-grow flex flex-col justify-between">
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Author :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Ingo Swann
								</span>
							</div>
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Title :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Penetration
								</span>
							</div>
						</div>
						<RxCross1 className="self-center cursor-pointer p-0.5 hover:text-gray-600" />
					</div>
					<div className="flex justify-between gap-2 items-stretch text-black bg-[#F4F4F4] rounded-lg p-2">
						<img
							className="rounded-lg h-12 w-12 object-fill"
							src={`images/books/sapiens.png`}
						/>
						<div className="flex-grow flex flex-col justify-between">
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Author :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Ingo Swann
								</span>
							</div>
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Title :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Penetration
								</span>
							</div>
						</div>
						<RxCross1 className="self-center cursor-pointer p-0.5 hover:text-gray-600" />
					</div>
					<div className="flex justify-between gap-2 items-stretch text-black bg-[#F4F4F4] rounded-lg p-2">
						<img
							className="rounded-lg h-12 w-12 object-fill"
							src={`images/books/sapiens.png`}
						/>
						<div className="flex-grow flex flex-col justify-between">
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Author :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Ingo Swann
								</span>
							</div>
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Title :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Penetration
								</span>
							</div>
						</div>
						<RxCross1 className="self-center cursor-pointer p-0.5 hover:text-gray-600" />
					</div>
					<div className="flex justify-between gap-2 items-stretch text-black bg-[#F4F4F4] rounded-lg p-2">
						<img
							className="rounded-lg h-12 w-12 object-fill"
							src={`images/books/sapiens.png`}
						/>
						<div className="flex-grow flex flex-col justify-between">
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Author :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Ingo Swann
								</span>
							</div>
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Title :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Penetration
								</span>
							</div>
						</div>
						<RxCross1 className="self-center cursor-pointer p-0.5 hover:text-gray-600" />
					</div>
					<div className="flex justify-between gap-2 items-stretch text-black bg-[#F4F4F4] rounded-lg p-2">
						<img
							className="rounded-lg h-12 w-12 object-fill"
							src={`images/books/sapiens.png`}
						/>
						<div className="flex-grow flex flex-col justify-between">
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Author :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Ingo Swann
								</span>
							</div>
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Title :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Penetration
								</span>
							</div>
						</div>
						<RxCross1 className="self-center cursor-pointer p-0.5 hover:text-gray-600" />
					</div>
					<div className="flex justify-between gap-2 items-stretch text-black bg-[#F4F4F4] rounded-lg p-2">
						<img
							className="rounded-lg h-12 w-12 object-fill"
							src={`images/books/sapiens.png`}
						/>
						<div className="flex-grow flex flex-col justify-between">
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Author :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Ingo Swann
								</span>
							</div>
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Title :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Penetration
								</span>
							</div>
						</div>
						<RxCross1 className="self-center cursor-pointer p-0.5 hover:text-gray-600" />
					</div>
					<div className="flex justify-between gap-2 items-stretch text-black bg-[#F4F4F4] rounded-lg p-2">
						<img
							className="rounded-lg h-12 w-12 object-fill"
							src={`images/books/sapiens.png`}
						/>
						<div className="flex-grow flex flex-col justify-between">
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Author :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Ingo Swann
								</span>
							</div>
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Title :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Penetration
								</span>
							</div>
						</div>
						<RxCross1 className="self-center cursor-pointer p-0.5 hover:text-gray-600" />
					</div>
					<div className="flex justify-between gap-2 items-stretch text-black bg-[#F4F4F4] rounded-lg p-2">
						<img
							className="rounded-lg h-12 w-12 object-fill"
							src={`images/books/sapiens.png`}
						/>
						<div className="flex-grow flex flex-col justify-between">
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Author :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Ingo Swann
								</span>
							</div>
							<div className="flex justify-start items-center gap-1">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Title :
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
									Penetration
								</span>
							</div>
						</div>
						<RxCross1 className="self-center cursor-pointer p-0.5 hover:text-gray-600" />
					</div>
				</div>
				<div
					className="cursor-pointer hover:text-gray-500 font-roboto-condensed text-sm font-medium flex justify-center items-center gap-2"
					onClick={() => setExpanded(!expanded)}
				>
					{expanded ? (
						<span> View Less</span>
					) : (
						<span>View All </span>
					)}

					{expanded ? <IoIosArrowUp /> : <IoIosArrowDown />}
				</div>
			</div>
		</div>
	);
};

export default EngineBooks;
