import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Navigate, Outlet } from "react-router";

interface ProtectedProps {
	children?: React.ReactNode;
	route?: boolean;
}

const Protected = ({ children, route = false }: ProtectedProps) => {
	const { user } = useAppSelector((state) => state.auth);

	const allowed = user?.username === "chadthechad" || user?.username === "zeeshan";

	if(route) return allowed ? <Outlet /> : <Navigate to="/401" replace />;

	return allowed ? <>{children}</> : <></>;
};

export default Protected;