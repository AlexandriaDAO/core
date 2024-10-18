import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import { useFormik } from "formik";
import { BiPlus } from "react-icons/bi";
import { ImSpinner8 } from "react-icons/im";
import { LiaSaveSolid } from "react-icons/lia";
import * as Yup from "yup";
import { EngineStatus } from "@/features/engine-overview/thunks/updateEngineStatus";
import useSession from "@/hooks/useSession";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import addEngine from "../thunks/addEngine";
import logout from "@/features/auth/thunks/logout";
import {
	setNewEngine,
	setNewEngineError,
	setNewEngineLoading,
} from "../myEnginesSlice";
import { CiCircleCheck } from "react-icons/ci";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { getAuthClient } from "@/features/auth/utils/authUtils";


import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/lib/components/dialog"
import { Button } from "@/lib/components/button";

const EngineSchema = Yup.object().shape({
	title: Yup.string()
		.min(2, "Title is too short")
		.max(50, "Title is too long")
		.required("Engine Title is required"),
	host: Yup.string()
		// .url("Host should be a valid url")
		// not working for localhosts
		.min(5, "Host is too short")
		.max(100, "Host is too long")
		.required("Host is required"),
	key: Yup.string()
		.min(5, "Key is too short")
		.max(50, "Key is too long")
		.required("Key is required"),
	index: Yup.string()
		.min(2, "Index is too short")
		.max(50, "Index is too long")
		.required("Index is required"),
	status: Yup.number().oneOf(
		[EngineStatus.Draft, EngineStatus.Published],
		"Invalid Status"
	),
});

const AddEngine = () => {
	const dispatch = useAppDispatch();
	const { newEngineLoading, newEngine, newEngineError } = useAppSelector(
		(state) => state.myEngines
	);

	const formik = useFormik({
		initialValues: {
			title: "",
			host: "",
			key: "",
			index: "",
			status: EngineStatus.Draft,
		},
		validationSchema: EngineSchema,
		validateOnBlur: true, // Validate form field on blur
		validateOnChange: true, // Validate form field on change
		onSubmit: async (values) => {
			const client = await getAuthClient();
			if (client) {
				if (await client.isAuthenticated()) {
					dispatch(addEngine(values));
				} else {
					dispatch(logout(client));
				}
			}
		},
	});

	const resetNewEngine = ()=>{
		dispatch(setNewEngine(null));
		dispatch(setNewEngineLoading(false));
		dispatch(setNewEngineError(""));
		formik.resetForm()
	}
	useEffect(() => resetNewEngine, []);

	// useEffect(() => {
	// 	if(!addEngineModal && (newEngine || newEngineError)) resetNewEngine()
	// }, [addEngineModal]);

	return (
		<>
			<Dialog>
				<DialogTrigger asChild>
					<BiPlus
						// onClick={() => setAddEngineModal(true)}
						size={36}
						className="p-2 border border-solid rounded-full cursor-pointer bg-black text-white hover:bg-white hover:text-black hover:border-black transition-all duration-100"
					/>
				</DialogTrigger>

				{newEngine ? (
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>
								<div className="flex gap-1 justify-start items-center">
									<CiCircleCheck
										size={24}
										className="text-green-400"
									/>
									<span>Engine Added</span>
								</div>
							</DialogTitle>
							<DialogDescription>Engine has been stored successfully.</DialogDescription>
						</DialogHeader>
					</DialogContent>
				) : newEngineError ? (
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>
								<div className="flex gap-1 justify-start items-center">
									<AiOutlineCloseCircle
										size={24}
										className="text-red-400"
									/>
									<span>Engine Error</span>
								</div>
							</DialogTitle>
							<DialogDescription>Error Occurred! {newEngineError}</DialogDescription>
						</DialogHeader>
					</DialogContent>
				) : (
					<DialogContent className="sm:max-w-[600px]">
						<DialogHeader>
							<DialogTitle>Add Engine</DialogTitle>
							<DialogDescription>Add your Engine, It can be from Meili cloud or Akash Instance.</DialogDescription>
						</DialogHeader>
						<form
							onSubmit={formik.handleSubmit}
							className="flex flex-col gap-2 "
						>
							<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
								<label className="text-lg" htmlFor="title">
									Title
								</label>
								<input
									className={`w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-xl ${
										formik.touched.title &&
										formik.errors.title
											? "border-red-500"
											: ""
									}`}
									id="title"
									name="title"
									type="text"
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.title}
								/>
								{formik.touched.title &&
									formik.errors.title && (
										<span className="text-red-400 text-sm">
											{formik.errors.title}
										</span>
									)}
							</div>
							<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
								<label className="text-lg" htmlFor="host">
									Host
								</label>
								<input
									className={`w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-xl ${
										formik.touched.host &&
										formik.errors.host
											? "border-red-500"
											: ""
									}`}
									id="host"
									name="host"
									type="text"
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.host}
								/>
								{formik.touched.host && formik.errors.host && (
									<span className="text-red-400 text-sm">
										{formik.errors.host}
									</span>
								)}
							</div>
							<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
								<label className="text-lg" htmlFor="key">
									Key
								</label>
								<input
									className={`w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-xl ${
										formik.touched.key && formik.errors.key
											? "border-red-500"
											: ""
									}`}
									id="key"
									name="key"
									type="text"
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.key}
								/>
								{formik.touched.key && formik.errors.key && (
									<span className="text-red-400 text-sm">
										{formik.errors.key}
									</span>
								)}
							</div>
							<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
								<label className="text-lg" htmlFor="index">
									Index
								</label>
								<input
									className={`w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-xl ${
										formik.touched.index &&
										formik.errors.index
											? "border-red-500"
											: ""
									}`}
									id="index"
									name="index"
									type="text"
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.index}
								/>
								{formik.touched.index &&
									formik.errors.index && (
										<span className="text-red-400 text-sm">
											{formik.errors.index}
										</span>
									)}
							</div>
							<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
								<label className="text-lg" htmlFor="status">
									Status
								</label>
								<select
									className={`w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-xl ${
										formik.touched.status &&
										formik.errors.status
											? "border-red-500"
											: ""
									}`}
									name="status"
									id="status"
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.status}
								>
									<option value="0">Draft</option>
									<option value="1">Published</option>
								</select>
								{formik.touched.status &&
									formik.errors.status && (
										<span className="text-red-400 text-sm">
											{formik.errors.status}
										</span>
									)}
							</div>
							<DialogFooter className="flex justify-center items-center my-4">
								{newEngineLoading ? (
									<Button type="button" disabled rounded={"full"}>
									 	<ImSpinner8
									 		size={18}
									 		className="animate animate-spin"
									 	/>
										<span>Saving Engine</span>
									</Button>
								) : (
									<Button type="submit" rounded={"full"}>
										<LiaSaveSolid size={18} />
										<span>Save Engine</span>
									</Button>
								)}
							</DialogFooter>
						</form>
					</DialogContent>
				)}
			</Dialog>
		</>
	);
};

export default AddEngine;