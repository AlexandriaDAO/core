import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import MainLayout from "@/layouts/MainLayout";
import ArweaveSearch from "@/apps/libmodules/arweave";
import { setSearchFormOptions } from "@/apps/libmodules/arweave/redux/arweaveSlice";

function Alexandrian() {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setSearchFormOptions({
			showNftOwners: true,
			showContentCategory: true,
			showAdvancedOptions: true,
			showNsfwModelControl: false,
		}));
	}, [dispatch]);

	return (
		<MainLayout>
			<ArweaveSearch />
		</MainLayout>
	);
}

export default Alexandrian;
