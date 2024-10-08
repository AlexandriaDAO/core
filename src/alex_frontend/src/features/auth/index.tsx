import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";
import logout from "./thunks/logout";
import login from "./thunks/login";
import { ImSpinner8 } from "react-icons/im";
import { MdLogin, MdLogout } from "react-icons/md";
import { getAuthClient } from "./utils/authUtils";

export default function Auth() {
	const dispatch = useAppDispatch();

	const { user, loading } = useAppSelector((state) => state.auth);

	const handleAuthClick = async () => {
		const client = await getAuthClient();

		if (user) dispatch(logout(client));
		else dispatch(login(client));
	};
	return (
		<div
			onClick={handleAuthClick}
			className="flex-shrink h-auto flex justify-center items-center gap-2.5 p-2.5 border border-solid border-white text-black
			rounded-full cursor-pointer duration-300 transition-all"
		>
			{loading ? (
				<div className="flex gap-1 items-center text-[#828282]">
					<span className="text-base font-normal font-roboto-condensed tracking-wider">
						Processing
					</span>
					<ImSpinner8 size={18} className="animate animate-spin text-black" />
				</div>
			) : user ? (
				<div className="flex gap-1 items-center text-[#828282] hover:text-black">
					<span className="text-base font-normal font-roboto-condensed tracking-wider">
						{user.slice(0, 5) + "..." + user.slice(-3)}
					</span>
					<MdLogout size={20} className="text-black" />
				</div>
			) : (
				<div className="flex justify-between  gap-1 items-center text-[#828282] hover:text-black">
					<span className="text-base font-normal font-roboto-condensed tracking-wider">
						Login
					</span>    
					{/* <span><FontAwesomeIcon icon={faRightToBracket} /></span> */}
					<MdLogin size={20} className="text-black" />
				</div>
			)}
		</div>
	);
}
