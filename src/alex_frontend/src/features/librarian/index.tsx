import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import checkLibrarian from "./thunks/checkLibrarian";
import { useNavigate } from "react-router-dom";
import { Button } from "@/lib/components/button";
import { Check, LoaderCircle, LockKeyhole, X } from "lucide-react";

function Librarian() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const { isLibrarian, loading, error } = useAppSelector(
		(state) => state.librarian
	);

	useEffect(() => {
		dispatch(checkLibrarian());
	}, []);

	const handleViewProfileClick = () => {
		navigate("/librarian");
	}

	return (
		<div className="w-full p-3 flex gap-2 flex-col shadow-lg rounded-xl bg-white">
			<div className="flex justify-between items-center">
				<div className="font-syne font-medium text-xl text-black">
					Librarian
				</div>
			</div>
			<div className="flex flex-col gap-4 justify-start items-center">
				{loading ? (
					<LoaderCircle size={30} className="animate animate-spin" />
				) : error ? (
					<div className="flex flex-col items-center justify-between gap-3">
						<X
							size={40}
							color="red"
							className="bg-[#D9D9D9] rounded-full border border-solid border-dark p-2"
						/>
						<span className="font-roboto-condensed font-medium text-base">
							{error}
						</span>
						<Button
							disabled
							variant={"link"}
							scale={"sm"}>
							Try later !!!
						</Button>
					</div>
				) : isLibrarian ? (
					<div className="flex flex-col items-center justify-between gap-3">
						<div className="p-2 bg-muted border border-ring rounded-full">
							<Check size={22} className="text-constructive"/>
						</div>
						<span className="font-roboto-condensed font-medium text-base">
							You are a Librarian, You can Add Nodes.
						</span>
						<Button
							variant={"link"}
							scale={"sm"}
							onClick={handleViewProfileClick}>
							View Profile
						</Button>
					</div>
				) : (
					<div className="flex flex-col items-center justify-between gap-3">
						<div className="p-2 bg-muted border border-ring rounded-full">
							<LockKeyhole size={22} className="text-primary"/>
						</div>
						<span className="font-roboto-condensed font-medium text-base">
							Become Librarian to create your personal nodes and
							access librarian profile data
						</span>
						<Button
							variant={"link"}
							scale={"sm"}
							onClick={() => navigate('/librarian')}>
							<span>Become Librarian</span>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

export default Librarian;