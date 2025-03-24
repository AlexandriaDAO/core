import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Navigate, Outlet } from "react-router";

interface ProtectedProps {
	children?: React.ReactNode;
	route?: boolean;
}

const Protected = ({ children, route = false }: ProtectedProps) => {
	const { user } = useAppSelector((state) => state.auth);

	const allowed = user?.username === "evanmcfarland" || user?.username === "zeeshan" || user?.username === "asdfasdf" || user?.username === "adill323";

	if(route) return allowed ? <Outlet /> : <Navigate to="/401" replace />;

	return allowed ? <>{children}</> : <></>;
};

export default Protected;