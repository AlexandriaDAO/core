import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";
import { setBooks, setLimit } from "../portal/portalSlice";
import fetchBooks from "../portal/thunks/fetchBooks";

const PortalLimit: React.FC = () => {
	const dispatch = useAppDispatch();
	const {limit} = useAppSelector(state=>state.portal);

	useEffect(() => {
		dispatch(fetchBooks())
	}, [limit])

	return (
		<div className="flex gap-2 justify-center items-center">
			<label htmlFor="limit" className="cursor-pointer">Limit</label>
			<select
				id="limit"
				className="cursor-pointer bg-muted border border-ring focus:border-primary px-2 rounded text-primary"
				onChange={(e) => dispatch(setLimit(Number(e.target.value)))}
			>
				<option value="10">10</option>
				<option value="20">20</option>
				<option value="50">50</option>
				<option value="100">100</option>
			</select>
		</div>
	);
};

export default PortalLimit;
