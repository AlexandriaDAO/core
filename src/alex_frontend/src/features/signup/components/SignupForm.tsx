import React, { useEffect, useState } from "react";
import {
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/lib/components/dialog";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Button } from "@/lib/components/button";
import { Label } from "@/lib/components/label";
import { Input } from "@/lib/components/input";
import { User, Save, LoaderCircle } from "lucide-react";
import { useUser } from "@/hooks/actors";
import { useDebounce } from "@/hooks/useDebounce";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { UsernameAvailabilityResponse } from "../../../../../../src/declarations/user/user.did";
import signup from "../thunks/signup";

const UserSchema = Yup.object().shape({
	username: Yup.string()
		.min(6, "Username must be at least 6 characters")
		.max(20, "Username must be at most 20 characters")
		.matches(
			/^[a-zA-Z0-9_-]+$/,
			"Username can only contain letters, numbers, underscores and hyphens"
		)
		.required("Username is required"),
	agreeToTerms: Yup.boolean()
		.oneOf([true], "You must agree to the terms and conditions")
		.required("Agreement is required"),
});

const SignupForm = () => {
	const { actor } = useUser();
	const dispatch = useAppDispatch();
    const {error, loading} = useAppSelector(state=>state.signup);

    const [availability, setAvailability] = useState<UsernameAvailabilityResponse | null>(null);

	const formik = useFormik({
		initialValues: {
			username: "",
			agreeToTerms: false,
		},
		validationSchema: UserSchema,
		validateOnBlur: true, // Validate form field on blur
		validateOnChange: true, // Validate form field on change
		onSubmit: async (values) => {
			if (!actor) return;
			dispatch(signup({ actor, username: values.username }));
		},
	});

	// Debounce username changes to prevent too many API calls
	const debouncedUsername = useDebounce(formik.values.username, 500);

	// Check username availability when username changes
	useEffect(() => {
		const checkAvailability = async () => {
			if (!actor || !debouncedUsername || formik.errors.username) {
				setAvailability(null);
				return;
			}

			try {
				const result = await actor.check_username_availability(debouncedUsername);

				console.log(result);

                if('Ok' in result){
                    setAvailability(result.Ok);
					return;
                }

                throw new Error('Unknown Error');
			} catch (error) {
				setAvailability({
                    username: debouncedUsername,
                    available: false,
					message: "Error checking username availability",
				});
			}
		};

		checkAvailability();
	}, [debouncedUsername, actor]);

	return (
		<>
			<DialogHeader>
				<DialogTitle>
					<div className="flex gap-1 justify-start items-center">
						<User size={20} className="text-green-400" />
						<span>Signup</span>
					</div>
				</DialogTitle>
				<DialogDescription>Create a username.</DialogDescription>
				{error && <DialogDescription className="text-destructive">{error}</DialogDescription>}
			</DialogHeader>
			<form
				onSubmit={formik.handleSubmit}
				className="flex flex-col gap-4"
			>
				<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
					{/* <Label htmlFor="username" variant={(formik.touched.username && formik.errors.username ? "destructive" : "default" )}>
						Username
					</Label> */}
					<Input
						variant={
							formik.touched.username
								? formik.errors.username ? "destructive" : availability?.available ? "constructive" : "destructive"
								: "default"
						}
						id="username"
						name="username"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.username}
					/>
					{formik.touched.username && formik.errors.username && (
						<span className="text-red-400 text-sm">
							{formik.errors.username}
						</span>
					)}
					{!formik.errors.username && availability && (
						<span
							className={`text-sm ${
								availability.available
									? "text-constructive"
									: "text-destructive"
							}`}
						>
							{availability.message}
						</span>
					)}
				</div>
				<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
					<div className="flex items-center gap-2">
						<input
							onChange={formik.handleChange}
							className="cursor-pointer w-4 h-4"
							type="checkbox"
							id="agreeToTerms"
							name="agreeToTerms"
							checked={formik.values.agreeToTerms}
						/>
						<Label
							htmlFor="agreeToTerms"
							variant={
								formik.touched.agreeToTerms &&
								formik.errors.agreeToTerms
									? "destructive"
									: "default"
							}
						>
							I agree to the terms and conditions
						</Label>
					</div>

					{formik.touched.agreeToTerms &&
						formik.errors.agreeToTerms && (
							<span className="text-red-400 text-sm">
								{formik.errors.agreeToTerms}
							</span>
						)}
				</div>
				<div className="flex justify-center items-center my-4">
					<DialogFooter>
						{loading ? (
							<Button type="button" disabled rounded={"full"}>
								<LoaderCircle
									size={18}
									className="animate animate-spin"
								/>
								<span>Processing...</span>
							</Button>
						) : (
							<Button type="submit" rounded={"full"}>
								<Save size={18} />
								<span>Save User</span>
							</Button>
						)}
					</DialogFooter>
				</div>
			</form>
		</>
	)
}

export default SignupForm;