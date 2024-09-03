import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";
import logout from "./thunks/logout";
import login from "./thunks/login";
import { ImSpinner8 } from "react-icons/im";
import { AiOutlineLogin, AiOutlineLogout } from "react-icons/ai";
import useSession from "@/hooks/useSession";
import principal from "./thunks/principal";
import { MdLogin, MdLogout } from "react-icons/md";

export default function Auth() {
	const { authClient } = useSession();
	const dispatch = useAppDispatch();

	const { filter } = useAppSelector((state) => state.home);
	const { user, loading } = useAppSelector((state) => state.auth);

	const handleAuthClick = () => {
		if (!authClient) {
			console.error("Auth Client not initialized");
			return;
		}

		if (user) dispatch(logout(authClient));
		else dispatch(login(authClient));
	};
	return (
		<div
			onClick={handleAuthClick}
			className="flex-shrink h-auto flex justify-center items-center gap-2.5 p-2.5 border border-solid border-white text-white
			rounded-full cursor-pointer duration-300 transition-all"
		>
			{loading ? (
				<div className="flex gap-1 items-center text-[#828282]">
					<span className="text-base font-normal font-roboto-condensed tracking-wider">
						Processing
					</span>
					<ImSpinner8 size={18} className="animate animate-spin text-white" />
				</div>
			) : user ? (
				<div className="flex gap-1 items-center text-[#828282] hover:text-white">
					<span className="text-base font-normal font-roboto-condensed tracking-wider">
						{user.slice(0, 5) + "..." + user.slice(-3)}
					</span>
					<MdLogout size={20} className="text-white" />
				</div>
			) : (
				<div className="flex gap-1 items-center text-[#828282] hover:text-white">
					<span className="text-base font-normal font-roboto-condensed tracking-wider">
						Login
					</span>
					<MdLogin size={20} className="text-white" />
				</div>
			)}
		</div>
	);
}
