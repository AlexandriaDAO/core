import React, { useMemo } from "react";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toggleSortOrder } from "../store/slice";
import { SortAsc } from "lucide-react";

interface SortToggleProps {
	isLoading: boolean;
	count: number;
}

const SortToggle: React.FC<SortToggleProps> = ({
	isLoading,
	count,
}) => {
	const dispatch = useAppDispatch();
	const { sortOrder } = useAppSelector((state) => state.permasearch);

    const title = useMemo(() => {
        if (count <= 1) {
            return "Sorting disabled - only one result";
        }
        return "Toggle between newest and oldest";
    }, [count]);

	return (
		<Button
			onClick={() => dispatch(toggleSortOrder())}
			disabled={isLoading || count <= 1}
			variant="outline"
			className="flex items-center gap-2 h-10"
			title={title}
		>
            <SortAsc className={`h-4 w-4${sortOrder === "HEIGHT_DESC" ? "" : " rotate-180"}`} />
            {sortOrder === "HEIGHT_DESC" ? "Newest" : "Oldest"}
		</Button>
	);
};

export default SortToggle;
