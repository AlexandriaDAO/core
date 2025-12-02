import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import MintedBook from "./components/MintedBook";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import fetchEngineBooks from "./thunks/fetchEngineBooks";
import { setExpanded } from "./engineBooksSlice";
import { ChevronDown, ChevronUp, LoaderCircle, Search } from "lucide-react";
import useSession from "@/hooks/useSession";

const TO_DISPLAY = 5;

const EngineBooks = () => {
	const {meiliIndex} = useSession();
	const dispatch = useAppDispatch();

	const { user } = useAppSelector((state) => state.auth);
	const { activeEngine } = useAppSelector((state) => state.engineOverview);

	const { expanded, loading, error, books } = useAppSelector((state) => state.engineBooks);

    useEffect(() => {
		if(!activeEngine) return;

        dispatch(fetchEngineBooks(activeEngine));
    }, []);

	return (
		<div className="bg-white rounded-lg">
			{/* <div className="flex justify-between items-center p-4 border-b border-solid border-black">
				<span className="font-roboto-condensed font-bold text-xl leading-6 text-black">
					Manage Books {"("+books.length+")"}
				</span>
				<span className="font-roboto-condensed text-base leading-[18px] text-gray-500">
					Clear All
				</span>
			</div> */}
			<div className="flex flex-col gap-2">
				{user && activeEngine && user.principal == activeEngine.owner && (
					<>
						<span className="font-roboto-condensed text-base leading-[18px] text-black font-normal">
							Add Book
						</span>
						<div className="flex justify-between items-center gap-4">
							<div className="flex-grow border border-solid border-gray-500 rounded-full flex items-center gap-2 px-4 py-2">
								<Search />
								<input
									type="text"
									placeholder="Search"
									className="font-roboto-condensed font-normal text-base flex-grow rounded border-0 ring-0 focus:ring-0 outline-none"
								/>
							</div>
						</div>
					</>
				)}
				<div className="flex gap-1 justify-start items-center font-roboto-condensed text-base leading-[18px] text-black font-normal">
					{loading &&	<span>Loading</span> }
					<span>Added Books</span>
					{ loading && <LoaderCircle
						size={14}
						className="animate animate-spin"
					/>}
				</div>
				{error &&
					<div className="flex flex-col gap-2 justify-start items-start font-roboto-condensed text-base leading-[18px] text-black font-normal">
						<span>Error loading books</span>
						<span>{error}</span>
					</div>
				}
				<div
					className={`flex flex-col gap-2 ${
						expanded ? "h-auto" : "max-h-96 overflow-auto"
					}`}
				>
					{books.slice(0, expanded ? books.length : TO_DISPLAY).map(book => (
						<MintedBook key={book.manifest} book={book} />
					))}
				</div>
				{books.length > TO_DISPLAY && (
					<div
						className="cursor-pointer hover:text-gray-500 font-roboto-condensed text-sm font-medium flex justify-center items-center gap-2"
						onClick={() => dispatch(setExpanded(!expanded))}
					>
						{expanded ? (
							<span> View Less</span>
						) : (
							<span>View All </span>
						)}

						{expanded ? <ChevronUp /> : <ChevronDown />}
					</div>
				)}
			</div>
		</div>
	);
};

export default EngineBooks;
