import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/lib/components/dialog";

import LoginContent from "./components/LoginContent";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setOpen } from "./loginSlice";
import { XIcon } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const InlineLogin = () => {
	const dispatch = useAppDispatch();
	const {open} = useAppSelector(state => state.login);
	return (
		<Dialog open={open} >
			<DialogTrigger>
				<div onClick={() => dispatch(setOpen(true))} className="flex-shrink h-auto flex justify-between gap-1 px-4 py-2 items-center border border-white text-[#828282] hover:text-white rounded-full cursor-pointer transition-all duration-300">
					<span className="text-base font-normal font-roboto-condensed tracking-wider">
						Login
					</span>
				</div>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] font-roboto-condensed" closeIcon={<XIcon onClick={()=>dispatch(setOpen(false))} className="w-4 h-4" />}>
				<LoginContent />
			</DialogContent>
		</Dialog>
	)
}

export default InlineLogin;