import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Navigate, Outlet } from "react-router";

interface ProtectedProps {
	children?: React.ReactNode;
	route?: boolean;
	unauthorizedComponent?: React.ReactNode;
}

const Protected = ({ children, route = false, unauthorizedComponent }: ProtectedProps) => {
	const { user } = useAppSelector((state) => state.auth);

	const allowed = user?.username === "evanmcfarland" || user?.username === "zeeshan101" || user?.username === "sikandar" || user?.username === "asdfasdf" || user?.username === "adill323" || user?.username === "marcorubio";

	if(route) return allowed ? <Outlet /> : <Navigate to="/401" replace />;

	return allowed ? <>{children}</> : <>{unauthorizedComponent || <></>}</>;
};

export default Protected;