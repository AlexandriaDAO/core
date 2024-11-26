import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import MyNodes from "@/features/my-nodes";
import Header from "./Header";
import NoNode from "../components/NoNode";

const Profile = () => {
	const { nodes } = useAppSelector((state) => state.myNodes);

    return (
        <div className="basis-3/4 flex flex-col gap-6 p-8 shadow-lg rounded-xl bg-white">
            <Header />
            <div className="flex flex-col justify-between gap-2 items-center">
                {nodes.length > 0 ? <MyNodes /> : <NoNode />}
            </div>
        </div>
    );
}

export default Profile;