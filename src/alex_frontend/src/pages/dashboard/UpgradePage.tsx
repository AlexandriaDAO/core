import React, { Suspense, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Button } from "@/lib/components/button";
import { Label } from "@/lib/components/label";
import { LoaderCircle, Save } from "lucide-react";
import { useUser } from "@/hooks/actors";
import upgrade from "@/features/auth/thunks/upgrade";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useNavigate } from "react-router";
const TermsAndConditions = React.lazy(() => import('@/components/TermsAndConditions'));

const LibrarianSchema = Yup.object().shape({
	agreeToTerms: Yup.boolean()
		.oneOf([true], "You must agree to the terms and conditions")
		.required("Agreement is required"),});

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
		initialValues: {
			agreeToTerms: false,
		},
		validationSchema: LibrarianSchema,
		validateOnBlur: true, // Validate form field on blur
		validateOnChange: true, // Validate form field on change
		onSubmit: async (values) => {
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
					<Suspense fallback={<div>Loading...</div>}>
						<TermsAndConditions />
					</Suspense>

					<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
						<div className="flex items-center gap-2">
							<input onChange={formik.handleChange} className="cursor-pointer w-4 h-4" type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formik.values.agreeToTerms} />
							<Label htmlFor="agreeToTerms" variant={(formik.touched.agreeToTerms && formik.errors.agreeToTerms ? "destructive" : "default" ) }>
								I agree to the terms and conditions
							</Label>
						</div>

						{formik.touched.agreeToTerms &&
							formik.errors.agreeToTerms && (
								<span className="text-destructive text-sm">
									{formik.errors.agreeToTerms}
								</span>
							)}
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
								<span>Save Form</span>
							</Button>
						)}

					</div>
				</form>
			</div>
		</>
	);
};

export default UpgradePage;