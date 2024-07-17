import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";

import { ImSpinner8 } from "react-icons/im";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import useSession from "@/hooks/useSession";
import { alex_backend } from "../../../../../src/declarations/alex_backend";
import { MdLockOutline } from "react-icons/md";
import checkLibrarian from "./thunks/checkLibrarian";
import { setIsLibrarian } from "./librarianSlice";
import { IoMdCheckmark } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import LibrarianForm from "./components/LibrarianForm";
import { setShowProfile } from "../librarian-profile/librarianProfileSlice";

function Librarian() {
	const { actor } = useSession();
	const dispatch = useAppDispatch();

	const { isLibrarian, loading, error } = useAppSelector(
		(state) => state.librarian
	);

	useEffect(() => {
		if (actor != alex_backend) {
			console.log("checking wether user is librarian or not");
			dispatch(checkLibrarian(actor));
		} else {
			console.log("its an anonymous user");
			dispatch(setIsLibrarian(false));
		}
	}, [actor]);

	const handleViewProfileClick = ()=> {
		dispatch(setShowProfile(true))
	}

	return (
		<div className="w-full p-3 flex gap-2 flex-col shadow-lg rounded-xl bg-white">
			<div className="flex justify-between items-center">
				<div className="font-syne font-medium text-xl text-black">
					Librarian Profile
				</div>
			</div>
			<div className="flex flex-col gap-4 justify-start items-center">
				{loading ? (
					<ImSpinner8 size={30} className="animate animate-spin" />
				) : error ? (
					<div className="flex flex-col items-center justify-between gap-3">
						<RxCross1
							size={40}
							color="red"
							className="bg-[#D9D9D9] rounded-full border border-solid border-dark p-2"
						/>
						<span className="font-roboto-condensed font-medium text-base">
							{error}
						</span>
						<button disabled={true} className="px-2 py-1 bg-black rounded cursor-not-allowed text-[#F6F930] font-medium font-roboto-condensed text-base">
							Try later !!!
						</button>
					</div>
				) : isLibrarian ? (
					<div className="flex flex-col items-center justify-between gap-3">
						<IoMdCheckmark
							size={40}
							color="green"
							className="bg-[#D9D9D9] rounded-full border border-solid border-dark p-2"
						/>
						<span className="font-roboto-condensed font-medium text-base">
							You are a Librarian, You can Add Nodes.
						</span>
						<button onClick={handleViewProfileClick} className="px-2 py-1 bg-black rounded cursor-pointer text-[#F6F930] font-medium font-roboto-condensed text-base">
							View Profile
						</button>
					</div>
				) : (
					<div className="flex flex-col items-center justify-between gap-3">
						<MdLockOutline
							size={40}
							color="black"
							className="bg-[#D9D9D9] rounded-full border border-solid border-dark p-2"
						/>
						<span className="font-roboto-condensed font-medium text-base">
							Become Librarian to create your personal nodes and
							access librarian profile data
						</span>
						<LibrarianForm />
					</div>
				)}
			</div>
		</div>
	);
}

export default Librarian;
