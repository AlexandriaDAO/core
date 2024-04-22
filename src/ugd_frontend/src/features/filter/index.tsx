import React, { useEffect } from "react";
import Types from "./components/Types";
import SubTypes from "./components/SubTypes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import useMeili from "@/hooks/useMeili";

function Filter() {
	const {performSearch} = useMeili();
	const {types, subTypes} = useAppSelector(state=>state.filter)
	useEffect(() => {
	  performSearch()
	}, [types, subTypes])

	return (
		<div className="flex-grow flex flex-col gap-4 py-4 transition-all duration-200 ease-in">
			<Types />
			<SubTypes />
		</div>
	);
}

export default Filter;
