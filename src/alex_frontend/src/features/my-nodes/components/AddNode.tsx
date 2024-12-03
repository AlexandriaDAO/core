import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import addNode from "../thunks/addNode";
import {
	setNewNode,
	setNewNodeError,
	setNewNodeLoading,
} from "../myNodesSlice";
import { Button } from "@/lib/components/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { Label } from "@/lib/components/label";
import { Input } from "@/lib/components/input";

import { CheckCircle, LoaderCircle, PlusCircle, Save, XCircle } from "lucide-react";
import { useUser } from "@/hooks/actors";

// const ethPrivateKeyRegex = /^[a-fA-F0-9]{64}$/;
// const ethPublicKeyRegex = /^0x[a-fA-F0-9]{128}$/;

const NodeSchema = Yup.object().shape({
	key: Yup.string()
		// .matches(ethPrivateKeyRegex, 'Private key must be a 64 character hexadecimal string')
		.required('Private key is required'),
	active: Yup.boolean(),
});

const AddNode = () => {
	const {actor} = useUser()
	const dispatch = useAppDispatch();
	const { newNodeLoading, newNode, newNodeError } = useAppSelector(
		(state) => state.myNodes
	);

	const formik = useFormik({
		initialValues: {
			key: "",
			active: true,
		},
		validationSchema: NodeSchema,
		validateOnBlur: true, // Validate form field on blur
		validateOnChange: true, // Validate form field on change
		onSubmit: async (values) => {
			if(!actor) return;
			dispatch(addNode({actor, input: values}));
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

	if (newNode) return <SuccessDialog />
	if (newNodeError) return <ErrorDialog error={newNodeError} />

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant={'inverted'} rounded="full" className="flex gap-1 justify-between items-center">
					<span>Add Node</span>
					<PlusCircle />
				</Button>
			</DialogTrigger>
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
						<Label htmlFor="key" variant={(formik.touched.key && formik.errors.key ? "destructive" : "default" ) }>
							Private Key
						</Label>
						<Input
							variant={(formik.touched.key ? formik.errors.key ? "destructive" : "constructive" : 'default' ) }
							id="key"
							name="key"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.key}
						/>
						{formik.touched.key &&
							formik.errors.key && (
								<span className="text-red-400 text-sm">
									{formik.errors.key}
								</span>
							)}
					</div>

					<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
						<Label htmlFor="active" variant={(formik.touched.active && formik.errors.active ? "destructive" : "default" ) }>
							Status
						</Label>
						<select
							className={`w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-xl ${
								formik.touched.active &&
								formik.errors.active
									? "border-red-500"
									: ""
							}`}
							name="active"
							id="active"
							value={formik.values.active ? "1":"0"}
							onChange={(e) => {
								formik.setFieldValue('active', e.target.value === "1")
							}}
							onBlur={formik.handleBlur}
						>
							<option value="0">InActive</option>
							<option value="1">Active</option>
						</select>
						{formik.touched.active &&
							formik.errors.active && (
								<span className="text-red-400 text-sm">
									{formik.errors.active}
								</span>
							)}
					</div>
					<div className="flex justify-center items-center my-4">
						<DialogFooter>
							{newNodeLoading ? (
								<Button type="button" disabled rounded="full">
									<LoaderCircle
										size={18}
										className="animate animate-spin"
									/>
									<span>Saving Node</span>
								</Button>
							) : (
								<Button type="submit" rounded={"full"}>
									<Save size={18} />
									<span>Save Node</span>
								</Button>
							)}
						</DialogFooter>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};


const SuccessDialog = () => (
	<Dialog>
		<DialogTrigger asChild>
			<Button variant="info">
				<span>Node Created</span>
			</Button>
		</DialogTrigger>
		<DialogContent closeIcon={null} className="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>
					<div className="flex gap-1 justify-start items-center">
						<CheckCircle size={24} className="text-green-400" />
						<span>Node Added</span>
					</div>
				</DialogTitle>
				<DialogDescription>Node has been stored successfully.</DialogDescription>
			</DialogHeader>
			<DialogFooter className="sm:justify-start">
				<DialogClose asChild>
					<Button type="button" variant="outline">Close</Button>
				</DialogClose>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);

const ErrorDialog = ({ error }: { error: string }) => (
	<Dialog>
		<DialogTrigger asChild>
			<Button variant="destructive">
				<span>Node Error</span>
			</Button>
		</DialogTrigger>
		<DialogContent closeIcon={null} className="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>
					<div className="flex gap-1 justify-start items-center">
						<XCircle size={24} className="text-red-400" />
						<span>Node Error</span>
					</div>
				</DialogTitle>
				<DialogDescription>Error Occurred! {error}</DialogDescription>
			</DialogHeader>
			<DialogFooter className="sm:justify-start">
				<DialogClose asChild>
					<Button type="button" variant="outline">Close</Button>
				</DialogClose>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);

export default AddNode;