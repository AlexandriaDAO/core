import React from "react";
import { User } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/dialog";

import { useInternetIdentity } from "ic-use-internet-identity";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Processors from "./processors";
import Processing from "./components/Processing";

export default function Login({fullpage = false}) {
	const LoginContent = (
		<>
			<DialogHeader>
				<DialogTitle>
					<div className="flex gap-1 justify-start items-center">
						<User size={24} className="text-green-400" />
						<span>Login</span>
					</div>
				</DialogTitle>
				<DialogDescription>Choose a way to authenticate yourself.</DialogDescription>
			</DialogHeader>
			<Processors />
		</>
	)

	if(fullpage){
		return (
			<Dialog open>
				<DialogContent className="sm:max-w-[425px] font-roboto-condensed" closeIcon={null} onOpenAutoFocus={(e) => e.preventDefault()}>
					{LoginContent}
				</DialogContent>
			</Dialog>
		)
	}


	const { isInitializing, isLoggingIn } = useInternetIdentity();
	const {loading} = useAppSelector(state=>state.login)

	if(isInitializing || isLoggingIn || loading) return <Processing />

	return(
		<Dialog >
			<DialogTrigger>
				<div className="flex-shrink h-auto flex justify-between gap-1 px-4 py-2 items-center border border-white text-[#828282] hover:text-white rounded-full cursor-pointer transition-all duration-300">
					<span className="text-base font-normal font-roboto-condensed tracking-wider">
						Login
					</span>
				</div>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] font-roboto-condensed">
				{LoginContent}
			</DialogContent>
		</Dialog>
	)
}
