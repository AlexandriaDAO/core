import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import FundNode from "@/features/fund-node";
import Summary from "./components/Summary";
import CreateNode from "./components/CreateNode";

const Librarian = () => {
	const { nodes, loading } = useAppSelector((state) => state.myNodes);

    return (
		<div className="w-1/3 grid grid-cols-1 gap-4">
			<Summary />
			<CreateNode />

			{!loading && nodes.length > 0 && <FundNode />}
		</div>
	);

}

export default Librarian;