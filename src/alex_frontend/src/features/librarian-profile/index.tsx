import React, { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setShowProfile } from "../librarian-profile/librarianProfileSlice";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import NoNode from "./components/NoNode";
import fetchMyNodes from "../my-nodes/thunks/fetchMyNodes";
import AddNode from "../my-nodes/components/AddNode";
import MyNodes from "../my-nodes";
import { LoaderCircle } from "lucide-react";


function LibrarianProfile() {
	const dispatch = useAppDispatch();
	const { nodes, loading } = useAppSelector((state) => state.myNodes);

	useEffect(()=>{
		dispatch(fetchMyNodes());
	},[])

	const handleLibrarianProfileCloseClick = () => {
		dispatch(setShowProfile(false));
	};

	return (
		<div className="flex flex-col shadow-lg rounded-xl bg-white">
			<div className="flex flex-col gap-6 p-8">
				<div className="flex justify-between">
					<div className="flex items-center gap-2">
						<span className="font-syne text-xl font-bold">
							Librarian Profile
						</span>
						{loading && (
							<LoaderCircle
								size={20}
								className="animate animate-spin"
							/>
						)}
					</div>
					<button
						onClick={handleLibrarianProfileCloseClick}
						className="font-roboto-condensed text-base leading-[18px] font-normal text-gray-400 hover:text-gray-700 transition-all duration-100"
					>
						Close Profile
					</button>
				</div>

                <div className="flex flex-col justify-between gap-2 items-center">
                    {nodes.length> 0 ? <MyNodes /> : <NoNode /> }

                    <AddNode />
                </div>
			</div>
		</div>
	);
}

export default LibrarianProfile;