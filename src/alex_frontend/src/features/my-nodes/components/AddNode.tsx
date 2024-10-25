import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import { useFormik } from "formik";
import { ImSpinner8 } from "react-icons/im";
import { LiaSaveSolid } from "react-icons/lia";
import * as Yup from "yup";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import addNode, { NodeStatus } from "../thunks/addNode";
import logout from "@/features/auth/thunks/logout";
import {
	setNewNode,
	setNewNodeError,
	setNewNodeLoading,
} from "../myNodesSlice";
import { CiCircleCheck } from "react-icons/ci";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { getAuthClient } from "@/features/auth/utils/authUtils";
import { Button } from "@/lib/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { BiPlus } from "react-icons/bi";

// const ethPrivateKeyRegex = /^[a-fA-F0-9]{64}$/;
// const ethPublicKeyRegex = /^0x[a-fA-F0-9]{128}$/;

const NodeSchema = Yup.object().shape({
	pvt_key: Yup.string()
		// .matches(ethPrivateKeyRegex, 'Private key must be a 64 character hexadecimal string')
		.required('Private key is required'),
	status: Yup.number().oneOf(
		[NodeStatus.InActive, NodeStatus.Active],
		"Invalid Status"
	),
});

const AddNode = () => {
	const dispatch = useAppDispatch();
	const { newNodeLoading, newNode, newNodeError } = useAppSelector(
		(state) => state.myNodes
	);

	const formik = useFormik({
		initialValues: {
			pvt_key: "",
			status: NodeStatus.Active,
		},
		validationSchema: NodeSchema,
		validateOnBlur: true, // Validate form field on blur
		validateOnChange: true, // Validate form field on change
		onSubmit: async (values) => {
			const client = await getAuthClient();
			if (await client.isAuthenticated()) {
				dispatch(addNode(values));
			} else {
				dispatch(logout(client));
			}
		},
	});

	const resetNewNode = ()=>{
		dispatch(setNewNode(null));
		dispatch(setNewNodeLoading(false));
		dispatch(setNewNodeError(""));
		formik.resetForm()
	}
	useEffect(resetNewNode, []);

	// useEffect(() => {
	// 	if(!addNodeModal && (newNode || newNodeError)) resetNewNode()
	// }, [addNodeModal]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button type="button" variant={'inverted'}>
					<span>Create A Node</span>
				</Button>
			</DialogTrigger>

			{newNode ? (
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>
							<div className="flex gap-1 justify-start items-center">
								<CiCircleCheck
									size={24}
									className="text-green-400"
								/>
								<span>Node Added</span>
							</div>
						</DialogTitle>
						<DialogDescription>Node has been stored successfully.</DialogDescription>
					</DialogHeader>
				</DialogContent>
			) : newNodeError ? (
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>
							<div className="flex gap-1 justify-start items-center">
								<AiOutlineCloseCircle
									size={24}
									className="text-red-400"
								/>
								<span>Node Error</span>
							</div>
						</DialogTitle>
						<DialogDescription>Error Occurred! {newNodeError}</DialogDescription>
					</DialogHeader>
				</DialogContent>
			) : (
				<DialogContent className="sm:max-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()}>
					<DialogHeader>
						<DialogTitle>Add Node</DialogTitle>
						<DialogDescription>Add your Node, It can be a private key of your ethereum wallet.</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={formik.handleSubmit}
						className="flex flex-col gap-2 "
					>
						<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
							<label className="text-lg" htmlFor="pvt_key">
								Private Key
							</label>
							<input
								className={`w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-xl ${
									formik.touched.pvt_key &&
									formik.errors.pvt_key
										? "border-red-500"
										: ""
								}`}
								id="pvt_key"
								name="pvt_key"
								type="text"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.pvt_key}
							/>
							{formik.touched.pvt_key &&
								formik.errors.pvt_key && (
									<span className="text-red-400 text-sm">
										{formik.errors.pvt_key}
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
								<option value="0">InActive</option>
								<option value="1">Active</option>
							</select>
							{formik.touched.status &&
								formik.errors.status && (
									<span className="text-red-400 text-sm">
										{formik.errors.status}
									</span>
								)}
						</div>
						<div className="flex justify-center items-center my-4">
							<DialogFooter>
								{newNodeLoading ? (
									<Button type="button" disabled rounded={"full"}>
										<ImSpinner8
											size={18}
											className="animate animate-spin"
										/>
										<span>Saving Node</span>
									</Button>
								) : (
									<Button type="submit" rounded={"full"}>
										<LiaSaveSolid size={18} />
										<span>Save Node</span>
									</Button>
								)}
							</DialogFooter>
						</div>
					</form>
				</DialogContent>
			)}
		</Dialog>
	);
};

export default AddNode;