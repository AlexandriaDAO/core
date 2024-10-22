import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import MainLayout from "@/layouts/MainLayout";
import ArweaveSearch from "@/apps/libmodules/arweave";
import { setSearchFormOptions } from "@/apps/libmodules/arweave/redux/arweaveSlice";

function Permasearch() {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setSearchFormOptions({
			showNftOwners: false,
			showContentCategory: true,
			showAdvancedOptions: true,
			showNsfwModelControl: true,
		}));
	}, [dispatch]);

	return (
		<MainLayout>
			<ArweaveSearch />
		</MainLayout>
	);
}

export default Permasearch;
