import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";

export default function AuthButton() {
	const dispatch = useAppDispatch();
	const {filter} = useAppSelector(state=>state.home);
	return (
		<div className={`flex-shrink h-auto flex justify-between items-center gap-2.5 p-4 border border-solid ${filter ? 'border-white text-white':'border-black'} rounded-full`}>
			<svg
				width="18"
				height="20"
				viewBox="0 0 18 20"
				fill="currentColor"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M16.7269 18.2235C16.2719 16.9475 15.267 15.8205 13.87 15.0165C12.473 14.2125 10.7609 13.7765 8.99995 13.7765C7.23895 13.7765 5.52695 14.2125 4.12995 15.0165C2.73295 15.8205 1.72795 16.9475 1.27295 18.2235"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
				/>
				<path
					d="M9 9.77649C11.2091 9.77649 13 7.98563 13 5.77649C13 3.56735 11.2091 1.77649 9 1.77649C6.79086 1.77649 5 3.56735 5 5.77649C5 7.98563 6.79086 9.77649 9 9.77649Z"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
				/>
			</svg>
		</div>
	);
}
