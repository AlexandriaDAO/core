import UpgradePage from "@/pages/dashboard/UpgradePage";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";
import { Outlet } from "react-router";

const LibrarianGuard = () => {
    const { user } = useAppSelector(state => state.auth);

    if(!user || !user.librarian) return <UpgradePage />;

	return <Outlet />;
};

export default LibrarianGuard;
