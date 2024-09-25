import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import { useFormik } from "formik";
import { BiPlus } from "react-icons/bi";
import { ImSpinner8 } from "react-icons/im";
import { LiaSaveSolid } from "react-icons/lia";
import * as Yup from "yup";
import useSession from "@/hooks/useSession";
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

	const { actorAlexLibrarian, actorVetkd, authClient } = useSession();

	const [addNodeModal, setAddNodeModal] = useState(false);

	const handleCancel = () => {
		setAddNodeModal(false);
	};

	const formik = useFormik({
		initialValues: {
			pvt_key: "",
			status: NodeStatus.Active,
		},
		validationSchema: NodeSchema,
		validateOnBlur: true, // Validate form field on blur
		validateOnChange: true, // Validate form field on change
		onSubmit: async (values) => {
			if (authClient) {
				if (await authClient.isAuthenticated()) {
					dispatch(addNode({ librarianActor: actorAlexLibrarian, vetkdActor: actorVetkd, node: values }));
				} else {
					dispatch(logout(authClient));
				}
			}
		},
	});

	const resetNewNode = ()=>{
		dispatch(setNewNode(null));
		dispatch(setNewNodeLoading(false));
		dispatch(setNewNodeError(""));
		formik.resetForm()
	}
	useEffect(() => resetNewNode, []);

	useEffect(() => {
		if(!addNodeModal && (newNode || newNodeError)) resetNewNode()
	}, [addNodeModal]);

	return (
		<>
			<button
				onClick={() => setAddNodeModal(true)}
				className="w-auto py-2 px-4 flex justify-center items-center rounded font-syne font-bold text-base transition-all duration-100 ease-in text-white bg-black cursor-pointer hover:bg-white hover:text-black hover:border hover:border-black"
			>
				Create ArWeave Node
			</button>

			<Modal
				open={addNodeModal}
				onCancel={handleCancel}
				footer={null}
				closable={false}
				className="min-w-[600px]"
				// classNames={{ content: '!p-0', }}
			>
				<main className="container h-full w-full flex flex-col flex-grow justify-between gap-4">
					<span className="font-syne text-xl font-bold">
						Add Node
					</span>

					{newNode ? (
						<div className="flex justify-center items-center flex-col gap-3">
							<CiCircleCheck
								size={30}
								className="text-green-400"
							/>
							<span className="mt-6 text-base leading-7 text-gray-600">
								Node has been added successfully
							</span>
						</div>
					) : newNodeError ? (
						<div className="flex justify-center items-center flex-col gap-3">
							<AiOutlineCloseCircle
								size={30}
								className="text-red-400"
							/>
							<span className="text-base leading-7 text-gray-600">
								An error Occurred while adding Node
							</span>
							<span className="text-base leading-7 text-gray-600">
								{newNodeError}
							</span>
						</div>
					) : (
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

							{newNodeLoading ? (
								<button
									type="button"
									disabled={true}
									className="w-44 py-3 self-center my-4 flex gap-2 justify-center items-center border border-black rounded-full font-roboto-condensed text-base leading-[18px] font-medium transition-all duration-100 ease-in bg-black text-white cursor-not-allowed"
								>
									<ImSpinner8
										size={20}
										className="animate animate-spin"
									/>
									<span>Saving Node</span>
								</button>
							) : (
								<button
									type="submit"
									className="w-44 py-3 self-center my-4 flex gap-2 justify-center items-center border border-black rounded-full font-roboto-condensed text-base leading-[18px] font-medium transition-all duration-100 ease-in text-black cursor-pointer hover:bg-black hover:text-white"
								>
									<LiaSaveSolid size={18} />
									<span>Save Node</span>
								</button>
							)}
						</form>
					)}
				</main>
			</Modal>
		</>
	);
};

export default AddNode;