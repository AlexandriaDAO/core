import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Button } from "@/lib/components/button";
import { LoaderCircle, Save } from "lucide-react";
import { useUser } from "@/hooks/actors";
import upgrade from "@/features/auth/thunks/upgrade";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useNavigate } from "react-router";

const LibrarianSchema = Yup.object().shape({});

const UpgradePage = () => {
	const {actor} = useUser();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const {user, librarianLoading, librarianError} = useAppSelector(state=>state.auth);


	useEffect(()=>{
		if(!user || user.librarian){
			navigate('/dashboard/profile')
		}
	}, [user])

	const formik = useFormik({
		initialValues: {},
		validationSchema: LibrarianSchema,
		validateOnBlur: true,
		validateOnChange: true,
		onSubmit: async () => {
			if(!actor) return;
			dispatch(upgrade(actor));
		},
	});

	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Upgrade Profile</h1>
			</div>
			<div className="font-roboto-condensed bg-secondary rounded-lg shadow-md p-6">
				<div className="mb-6 font-roboto-condensed">Become a librarian and you will be able to add your nodes.</div>
				{librarianError && <span className="text-destructive">{librarianError}</span>}
				<form
					onSubmit={formik.handleSubmit}
					className="flex flex-col gap-4"
				>
					<div className="mb-6 font-roboto-condensed">
						By upgrading to a librarian account, you acknowledge that this is a pre-alpha project and features may change.
					</div>

					<div className="flex justify-center">
						{librarianLoading ? (
							<Button type="button" disabled rounded={"full"}>
								<LoaderCircle
									size={18}
									className="animate animate-spin"
								/>
								<span>Saving Form</span>
							</Button>
						) : (
							<Button type="submit" rounded={"full"}>
								<Save size={18} />
								<span>Upgrade Account</span>
							</Button>
						)}

					</div>
				</form>
			</div>
		</>
	);
};

export default UpgradePage;