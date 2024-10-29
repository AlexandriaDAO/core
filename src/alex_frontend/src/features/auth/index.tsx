import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";
import logout from "./thunks/logout";
import login from "./thunks/login";
import { getAuthClient } from "./utils/authUtils";
import { LoaderCircle, LogIn, LogOut } from "lucide-react";

const Processing = () => (
	<div className="flex gap-1 items-center">
		<span className="text-base font-normal font-roboto-condensed tracking-wider">
			Processing
		</span>
		<LoaderCircle size={18} className="animate animate-spin"/>
	</div>
);

const Logout = ({ user }: { user: string }) => (
	<div className="flex gap-1 items-center">
		<span className="text-base font-normal font-roboto-condensed tracking-wider">
			{user.slice(0, 5) + "..." + user.slice(-3)}
		</span>
		<LogOut size={20} />
	</div>
);

const Login = () => (
	<div className="flex justify-between gap-1 items-center">
		<span className="text-base font-normal font-roboto-condensed tracking-wider">
			Login
		</span>
		<LogIn size={20} />
	</div>
);

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
			className="flex-shrink h-auto flex justify-center items-center gap-2.5 p-2.5 border border-solid border-white text-[#828282] hover:text-white rounded-full cursor-pointer duration-300 transition-all"
		>
			{loading ? <Processing /> : user ? <Logout user={user} /> : <Login />}
		</div>
	);
}
