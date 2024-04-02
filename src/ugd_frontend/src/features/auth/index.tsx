import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";
import LogOut from "./components/Logout";
import LogIn from "./components/Login";
import { login, logout } from "./authSlice";

export default function Auth() {
	const dispatch = useAppDispatch();

    const {filter} = useAppSelector((state) => state.home);
    const {user} = useAppSelector((state) => state.auth);


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
			{user ? <LogOut /> : <LogIn />}
		</div>
	);
}
