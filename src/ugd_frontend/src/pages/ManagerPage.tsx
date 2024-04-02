import React, { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { IoChevronForwardOutline } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp, IoIosSearch } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";

enum Tabs {
	Books = "Books",
	Filters = "Filters",
	Tasks = "Recent Tasks",
	Stats = "Cluster Stats",
}

function ManagerPage() {
	const [tab, setTab] = useState<Tabs>(Tabs.Books);

	const renderTabContent = () => {
		switch (tab) {
			case Tabs.Books:
				return <Books />;
			case Tabs.Filters:
				return <Filters />;
			case Tabs.Tasks:
				return <Tasks />;
			case Tabs.Stats:
				return <Stats />;
			default:
				return <></>;
		}
	};
	return (
		<MainLayout>
			<div className="flex-grow flex flex-col">
				<div className="flex justify-start items-center gap-2 px-8 pb-5">
					<span className="font-syne text-xl leading-6 font-medium text-black">
						Manager
					</span>
					<span className="font-syne text-xl leading-6 font-normal text-gray-500">
						<IoChevronForwardOutline />
					</span>
					<span className="font-syne text-xl leading-6 font-medium text-gray-500">
						Engine Creation
					</span>
				</div>
				<div className="flex flex-col gap-6 bg-gray-800 p-8 text-white">
					<div className="flex justify-between">
						<span className="font-syne text-2xl leading-6 font-semibold">
							Overview
						</span>
						<span className="font-roboto-condensed text-base leading-[18px] font-normal text-gray-300">
							Move To Drafts
						</span>
					</div>
					<div className="flex flex-col items-start">
						<div className="flex flex-col">
							<span className="font-roboto-condensed text-base leading-[18px] font-normal">
								Title
							</span>
							<span className="font-syne text-2xl leading-7 font-bold tracking-widest">
								History of Art Exploration
							</span>
						</div>
						<div className="flex gap-[4vw] justify-between border-t border-solid border-white py-6">
							<div className="flex flex-col gap-2">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Created by
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium">
									User 334
								</span>
							</div>

							<div className="flex flex-col gap-2">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Index
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium">
									UG DAO
								</span>
							</div>

							<div className="flex flex-col gap-2">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Created on
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium">
									Jan 1st 2024
								</span>
							</div>

							<div className="flex flex-col gap-2">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Books
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium">
									229
								</span>
							</div>

							<div className="flex flex-col gap-2">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Uses
								</span>
								<span className="font-roboto-condensed text-base leading-[18px] font-medium">
									1009
								</span>
							</div>

							<div className="flex flex-col gap-2">
								<span className="font-roboto-condensed text-base leading-[18px] font-normal">
									Status
								</span>
								<div className="flex gap-1 justify-start items-center">
									<span className="p-1.5 rounded-full bg-[#4AF77A]"></span>
									<span className="font-roboto-condensed text-base leading-[18px] font-medium">
										Published
									</span>
								</div>
							</div>
						</div>
					</div>
					<div className="flex gap-4 justify-end items-center">
						<button className="w-48 py-3 flex justify-center items-center border border-white rounded-full font-roboto-condensed text-base leading-[18px] font-medium cursor-pointer hover:bg-gray-700 hover:border-gray-700 transition-all duration-300 ease-in">
							Preview
						</button>
						<button className="w-48 py-3 flex justify-center items-center bg-black border border-black rounded-full font-roboto-condensed text-base leading-[18px] font-medium cursor-pointer hover:bg-gray-700 hover:border-gray-700 transition-all duration-300 ease-in">
							Save Changes
						</button>
					</div>
				</div>
				<div className="px-8 py-4 flex flex-col gap-4">
					<p className="font-syne font-semibold text-2xl leading-6">
						Settings
					</p>
					<div className="flex justify-start items-center gap-14">
						{Object.values(Tabs).map((t) => (
							<div
								key={t}
								className="flex flex-col items-stretch cursor-pointer"
								onClick={() => setTab(t)}
							>
								<span
									className={`font-roboto-condensed font-bold text-xl leading-6 hover:text-gray-500 ${
										tab === t
											? "text-black"
											: "text-gray-600"
									}`}
								>
									{t}
								</span>
								{tab === t && (
									<span className="border-2 w-4/5 self-center border-solid border-black hover:border-gray-500 rounded-full"></span>
								)}
							</div>
						))}
					</div>
					{renderTabContent()}
				</div>
			</div>
		</MainLayout>
	);
}

export default ManagerPage;

const Books = () => {
	const [expanded, setExpanded] = useState(false);
	return (
		<div className="bg-white rounded-lg">
			<div className="flex justify-between items-center p-4 border-b border-solid border-black">
				<span className="font-roboto-condensed font-bold text-xl leading-6 text-black">
					Manage Books {"(29)"}
				</span>
				<span className="font-roboto-condensed text-base leading-[18px] text-gray-500">
					Clear All
				</span>
			</div>
			<div className="p-4 flex flex-col gap-2">
				<span className="font-roboto-condensed text-base leading-[18px] text-black font-normal">
					Add Book
				</span>
				<div className="border border-solid border-gray-500 rounded-full flex items-center gap-2 px-4 py-2">
					<IoIosSearch />
					<input
						type="text"
						placeholder="Search"
						className="font-roboto-condensed font-normal text-base flex-grow rounded border-0 ring-0 focus:ring-0 outline-none"
					/>
				</div>
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

const Filters = () => {
	// Initial state with three checkboxes
	const [filters, setFilters] = useState({
		Fiction: false,
		Type: false,
		Title: false,
		SubType: false,
		PublicationYear: false,
		Author: false,
		Id: false,
	});

	return (
		<div className="bg-white rounded-lg">
			<div className="flex justify-between items-center p-4 border-b border-solid border-black">
				<span className="font-roboto-condensed font-bold text-xl leading-6 text-black">
					Applied Filters {"(1)"}
				</span>
				<span className="font-roboto-condensed text-base leading-[18px] text-gray-500">
					Clear All
				</span>
			</div>
			<div className="p-4 grid gap-y-8 gap-x-10 grid-flow-col grid-rows-4 justify-start">
				{Object.entries(filters).map(([key, value]) => (
					<label
						key={key}
						className={`cursor-pointer flex items-center gap-2.5 font-roboto-condensed text-base font-normal ${
							value ? "text-black" : "text-[#8E8E8E]"
						}`}
					>
						<input
							className="w-5 h-5"
							type="checkbox"
							name={key}
							checked={value}
							onChange={(e) => {
								setFilters({
									...filters,
									[key]: e.target.checked,
								});
							}}
						/>
						<span>{key}</span>
					</label>
				))}
			</div>
		</div>
	);
};

const Tasks = () => {
	const tasks = [
		{ id: 0, status: "succeeded", type: "indexCreation" },
		{ id: 1, status: "succeeded", type: "documentAdditionOrUpdate" },
		{ id: 2, status: "succeeded", type: "settingsUpdate" },
		{ id: 3, status: "succeeded", type: "indexCreation" },
		{ id: 4, status: "succeeded", type: "documentAdditionOrUpdate" },
		{ id: 5, status: "succeeded", type: "settingsUpdate" },
	];
	return (
		<div className="bg-white rounded-lg">
			<div className="flex justify-between items-center p-4 border-b border-solid border-black">
				<span className="font-roboto-condensed font-bold text-xl leading-6 text-black">
					Applied Filters {"(1)"}
				</span>
				<span className="font-roboto-condensed text-base leading-[18px] text-gray-500">
					Clear All
				</span>
			</div>
			<div className="p-4 flex flex-col gap-1 max-h-96 overflow-auto">
				{tasks.map((task) => (
					<span
						key={task.id}
						className="font-roboto-condensed font-normal text-xl"
					>
						Task ID: {task.id}, Status: {task.status}, type:{" "}
						{task.type}
					</span>
				))}
			</div>
		</div>
	);
};

const Stats = () => {
	const statsData = {
		databaseSize: 8863744,
		lastUpdate: "2024-03-19T12:47:45.917049437Z",
		indexes: {
			UGDAO: {
				numberOfDocuments: 945,
				isIndexing: false,
				fieldDistribution: {
					author: 945,
					cfi: 945,
					fiction: 945,
					id: 945,
					pubyear: 945,
					subtype: 945,
					text: 945,
					title: 945,
					type: 945,
				},
			},
		},
	};

	return (
		<div className="bg-white rounded-lg">
			<div className="flex justify-between items-center p-4 border-b border-solid border-black">
				<span className="font-roboto-condensed font-bold text-xl leading-6 text-black">
					Cluster Stats
				</span>
			</div>
			<div className="p-4 max-h-96 overflow-auto">
				<pre className="font-roboto-condensed font-normal text-xl">
					<code>{JSON.stringify(statsData, null, 2)}</code>
				</pre>
			</div>
		</div>
	);
};
