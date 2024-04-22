import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";
import logout from "./thunks/logout";
import login from "./thunks/login";
import { ImSpinner8 } from "react-icons/im";
import { AiOutlineLogin, AiOutlineLogout } from "react-icons/ai";

export default function Auth() {
	const dispatch = useAppDispatch();

    const {filter} = useAppSelector((state) => state.home);
    const {user, loading} = useAppSelector((state) => state.auth);


    const handleAuthClick = ()=>{
        if(user) dispatch(logout())
        else dispatch(login())
    }
	return (
		<div
			onClick={handleAuthClick}
			className={`flex-shrink h-auto flex justify-between items-center gap-2.5 p-4 border border-solid ${
				filter ? "border-white text-white" : "border-black"
			} rounded-full cursor-pointer duration-300 transition-all hover:bg-gray-200`}
		>
			{loading ? (
				<ImSpinner8 size={18} className="animate animate-spin" />
			) : user ? (
				<AiOutlineLogin size={20} className="rotate-180" />
			) : (
				<AiOutlineLogin size={20} />
			)}
		</div>
	);
}
