import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import LibrarianView from "./LibrarianView";
import NonLibrarianView from "./NonLibrarianView";

function LibrarianCard() {
	const { user } = useAppSelector(state => state.auth);

	return (
		<div className="max-w-md p-3 flex gap-2 flex-col rounded-xl border border-ring bg-white">
			<div className="flex justify-between items-center">
				<div className="font-syne font-medium text-xl text-black">
					Librarian
				</div>
			</div>
			<div className="flex flex-col gap-4 justify-start items-center">
				{ user!.librarian ? <LibrarianView /> : <NonLibrarianView/> }
			</div>
		</div>
	);
}

export default LibrarianCard;