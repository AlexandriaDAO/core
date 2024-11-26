import React from "react";
import { LoaderCircle } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Summary from "./Summary";
import CreateNode from "./CreateNode";
import FundNode from "@/features/fund-node";

const Sidebar = () => {
	const { nodes, loading } = useAppSelector((state) => state.myNodes);

    return (
		<div className="basis-1/4 flex flex-col items-start gap-4">
			<Summary />
			<CreateNode />
			{!loading && nodes.length > 0 && <FundNode />}
		</div>
	);

}



export default Sidebar;