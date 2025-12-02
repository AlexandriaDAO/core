import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import addEngine from "../thunks/addEngine";
import {
	setNewEngine,
	setNewEngineError,
	setNewEngineLoading,
} from "../myEnginesSlice";

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
import { Label } from "@/lib/components/label";
import { Input } from "@/lib/components/input";
import { Check, CheckCircle, Info, LoaderCircle, Plus, PlusCircle, Save, XCircle } from "lucide-react";
import { useUser } from "@/hooks/actors";

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
	active: Yup.boolean(),
});

const AddEngine = () => {
	const {actor} = useUser();

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
			active: false,
		},
		validationSchema: EngineSchema,
		validateOnBlur: true, // Validate form field on blur
		validateOnChange: true, // Validate form field on change
		onSubmit: async (values) => {
			if (actor) {
				dispatch(addEngine({actor,values}));
			}
		},
	});

	const resetNewEngine = ()=>{
		dispatch(setNewEngine(null));
		dispatch(setNewEngineLoading(false));
		dispatch(setNewEngineError(""));
		formik.resetForm()
	}
	useEffect(resetNewEngine, []);

	// useEffect(() => {
	// 	if(!addEngineModal && (newEngine || newEngineError)) resetNewEngine()
	// }, [addEngineModal]);

	if (newEngine) return <SuccessDialog />
	if (newEngineError) return <ErrorDialog error={newEngineError} />
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant={'inverted'} rounded="full" className="flex gap-1 justify-between items-center">
					<span>Add Engine</span>
					<PlusCircle />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()}>
				<DialogHeader>
					<DialogTitle>Add Engine</DialogTitle>
					<DialogDescription>Add your Engine, It can be from Meili cloud or Akash Instance.</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={formik.handleSubmit}
					className="flex flex-col gap-2 "
				>
					<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
						<Label htmlFor="title" variant={(formik.touched.title && formik.errors.title ? "destructive" : "default" ) }>
							Title
						</Label>
						<Input
							variant={(formik.touched.title ? formik.errors.title ? "destructive" : "constructive" : 'default' ) }
							id="title"
							name="title"
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
						<Label htmlFor="host" variant={(formik.touched.host && formik.errors.host ? "destructive" : "default" ) }>
							Host
						</Label>
						<Input
							variant={(formik.touched.host ? formik.errors.host ? "destructive" : "constructive" : 'default' ) }
							id="host"
							name="host"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.host}
						/>
						{/* <label className="text-lg" htmlFor="host">
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
						/> */}
						{formik.touched.host && formik.errors.host && (
							<span className="text-red-400 text-sm">
								{formik.errors.host}
							</span>
						)}
					</div>
					<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
						<Label htmlFor="key" variant={(formik.touched.key && formik.errors.key ? "destructive" : "default" ) }>
							Key
						</Label>
						<Input
							variant={(formik.touched.key ? formik.errors.key ? "destructive" : "constructive" : 'default' ) }
							id="key"
							name="key"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.key}
						/>
						{/* <label className="text-lg" htmlFor="key">
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
						/> */}
						{formik.touched.key && formik.errors.key && (
							<span className="text-red-400 text-sm">
								{formik.errors.key}
							</span>
						)}
					</div>
					<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
						<Label htmlFor="index" variant={(formik.touched.index && formik.errors.index ? "destructive" : "default" ) }>
							Index
						</Label>
						<Input
							variant={(formik.touched.index ? formik.errors.index ? "destructive" : "constructive" : 'default' ) }
							id="index"
							name="index"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.index}
						/>
						{/* <label className="text-lg" htmlFor="index">
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
						/> */}
						{formik.touched.index &&
							formik.errors.index && (
								<span className="text-red-400 text-sm">
									{formik.errors.index}
								</span>
							)}
					</div>
					<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
						<Label htmlFor="active" variant={(formik.touched.active && formik.errors.active ? "destructive" : "default" ) }>
							Status
						</Label>
						{/* <label className="text-lg" htmlFor="active">
							Status
						</label> */}
						<select
							className={`w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-xl ${
								formik.touched.active &&
								formik.errors.active
									? "border-red-500"
									: ""
							}`}
							name="active"
							id="active"
							onChange={(e) => {
								formik.setFieldValue('active', e.target.value === 'true')
							}}
							onBlur={formik.handleBlur}
							value={formik.values.active.toString()}
						>
							<option value="false">Draft</option>
							<option value="true">Published</option>
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
							{newEngineLoading ? (
								<Button type="button" disabled rounded={"full"}>
									<LoaderCircle
										size={18}
										className="animate animate-spin"
									/>
									<span>Saving Engine</span>
								</Button>
							) : (
								<Button type="submit" rounded={"full"}>
									<Save size={18} />
									<span>Save Engine</span>
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
			<Button variant={'constructive'} rounded="full" scale="icon">
				<Check />
			</Button>
		</DialogTrigger>
		<DialogContent closeIcon={null} className="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>
					<div className="flex gap-1 justify-start items-center">
						<CheckCircle size={24} className="text-green-400" />
						<span>Engine Added</span>
					</div>
				</DialogTitle>
				<DialogDescription>Engine has been stored successfully.</DialogDescription>
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
			<Button variant={'destructive'} rounded="full" scale="icon">
				<Info />
			</Button>
		</DialogTrigger>
		<DialogContent closeIcon={null} className="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>
					<div className="flex gap-1 justify-start items-center">
						<XCircle size={24} className="text-red-400" />
						<span>Engine Error</span>
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

export default AddEngine;