// import React, { useEffect } from "react";
// import { useAppSelector } from "@/store/hooks/useAppSelector";
// import { Navigate, Outlet } from "react-router";


// const AdminRoute = () => {
// 	const { user } = useAppSelector((state) => state.auth);

// 	if (user?.username !== "mrchad") {
// 		return <Navigate to="/401" replace />;
// 	}

// 	return <Outlet />;
// };

// export default AdminRoute;



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

	// if (!allowed)  return mode === 'route' ? <Navigate to="/401" replace /> : <></>;

	// if (mode === 'route') return <Outlet />;

	// return <>{children}</>;

	if(route) return allowed ? <Outlet /> : <Navigate to="/401" replace />;

	return allowed ? <>{children}</> : <></>;
};

export default Protected;
