import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Upgrade from "./Upgrade";
import Sidebar from "./Sidebar";
import Profile from "./Profile";
import LibrarianCard from "@/components/LibrarianCard";
import Loading from "@/components/Loading";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import fetchMyNodes from "../my-nodes/thunks/fetchMyNodes";
import { useUser } from "@/hooks/actors";

const Librarian = () => {
	const {actor} = useUser();

	const dispatch = useAppDispatch();

	const { user, librarianLoading } = useAppSelector((state) => state.auth);
	const { loading: loginLoading } = useAppSelector((state) => state.login);
	const { loading } = useAppSelector((state) => state.myNodes);


	useEffect(()=>{
		if(!actor) return;
		dispatch(fetchMyNodes(actor));
	},[user])


	if(loginLoading || loading || librarianLoading) return <Loading />

	if(!user) return (
		<div className="flex-grow flex justify-center items-center w-full h-full">
			User Not Available
		</div>
	)


    if(!user.librarian) return (
		<div className="flex-grow flex items-start p-4 gap-4">
			<div className="basis-1/4 flex flex-col items-start gap-4">
				<LibrarianCard />
			</div>
			<div className="basis-3/4 flex flex-col gap-6 p-8 shadow-lg rounded-xl bg-white">
				<Upgrade/>
			</div>
		</div>
	)

    return (
        <div className="flex-grow flex items-start p-4 gap-4">
            <Sidebar />
            <Profile />
        </div>
    )
}

export default Librarian;