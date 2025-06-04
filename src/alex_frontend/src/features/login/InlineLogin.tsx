import React, { lazy, Suspense } from "react";
import { Dialog, DialogTrigger } from "@/lib/components/dialog";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setOpen } from "./loginSlice";
import { XIcon } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Processing from "@/components/Processing";

// DialogContent will be loaded when it can be loaded, not blocking the ui
const DialogContent = lazy(() => import("@/lib/components/dialog").then(module => ({ default: module.DialogContent })));
// LoginContent will be loaded when login button is clicked, will show a loading state while it is loading
const LoginContent = lazy(() => import("./components/LoginContent"));

const InlineLogin = () => {
	const dispatch = useAppDispatch();
	const {open} = useAppSelector(state => state.login);
	return (
		<Suspense fallback={<Processing message="Loading..." />}>
			<Dialog open={open} >
				<DialogTrigger>
					<div onClick={() => dispatch(setOpen(true))} className="flex-shrink h-auto flex justify-between gap-1 px-4 py-2 items-center bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 text-white hover:text-white hover:border-white hover:from-gray-600 hover:to-gray-500 rounded-full cursor-pointer transition-all duration-300 font-medium">
						<span className="text-base font-normal font-roboto-condensed tracking-wider">
							Login
						</span>
					</div>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[500px] font-roboto-condensed px-6 py-3" closeIcon={<XIcon onClick={()=>dispatch(setOpen(false))} className="w-4 h-4" />}>
					<LoginContent />
				</DialogContent>
			</Dialog>
		</Suspense>
	)
}

export default InlineLogin;