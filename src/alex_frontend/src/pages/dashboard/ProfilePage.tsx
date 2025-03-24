import React, { useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle, Save, Upload } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import update from "@/features/auth/thunks/update";
import { Label } from "@/lib/components/label";
import { Input } from "@/lib/components/input";
import { Button } from "@/lib/components/button";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { UsernameAvailabilityResponse } from "../../../../../src/declarations/user/user.did";
import { useDebounce } from "@/hooks/useDebounce";
// import {AssetManager} from '@dfinity/assets';
// import { HttpAgent } from "@dfinity/agent";
// import { useInternetIdentity } from "ic-use-internet-identity/dist";

// const isLocal = process.env.DFX_NETWORK !== "ic";

const ProfileSchema = Yup.object().shape({
	username: Yup.string()
		.min(6, "Username must be at least 6 characters")
		.max(20, "Username must be at most 20 characters")
		.matches(
			/^[a-zA-Z0-9_-]+$/,
			"Username can only contain letters, numbers, underscores and hyphens"
		)
		.required("Username is required"),
	name: Yup.string()
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name cannot exceed 50 characters'),

	avatar: Yup.string()
		.url('Avatar must be a valid URL'),

	tnc: Yup.boolean()
		.oneOf([true], "You must agree to the terms and conditions")
		.required("Agreement is required"),
	});

function ProfilePage() {
	const {actor} = useUser();
	const dispatch = useAppDispatch();
	// const {identity} = useInternetIdentity();

	const {user, loading, error} = useAppSelector(state=>state.auth)
    const [availability, setAvailability] = useState<UsernameAvailabilityResponse | null>(null);

	const formik = useFormik({
		initialValues: {
			username: "",
			name: "",
			avatar: "",
			tnc: true,
		},
		validationSchema: ProfileSchema,
		validateOnBlur: true, // Validate form field on blur
		validateOnChange: true, // Validate form field on change
		onSubmit: async (values) => {
			if(!actor) return;
			// if(file) {
			// 	await uploadAvatar(file);
			// }
			dispatch(update({actor, input: values}));
		},
	});

	useEffect(()=>{
		if(!user) return;
		if(!formik.dirty) {
			formik.resetForm({values: {username: user.username, name: user.name, avatar: user.avatar, tnc: formik.values.tnc}})
		}else{
			formik.resetForm({values: formik.values})
		}
	}, [user])


	// Debounce username changes to prevent too many API calls
	const debouncedUsername = useDebounce(formik.values.username, 500);

	// Check username availability when username changes
	useEffect(() => {
		const checkAvailability = async () => {
			if (!actor || !debouncedUsername || formik.errors.username) {
				setAvailability(null);
				return;
			}

			// Only check availability if username has changed from original
			if (user && debouncedUsername === user.username) {
				setAvailability(null);
				return;
			}

			try {
				const result = await actor.check_username_availability(debouncedUsername);

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
	}, [debouncedUsername, actor, user]);

	// const [file, setFile] = useState<File | null>(null);

	// const fileInputRef = useRef<HTMLInputElement>(null);

	// useEffect(()=>{
	// 	if(!file) return;
	// 	const localUrl = `http://${ASSET_CANISTER}.localhost:${window.location.port}/${user?.principal}/avatar`;
	// 	const icUrl = `https://${ASSET_CANISTER}.icp0.io/${user?.principal}/avatar`;

	// 	formik.setFieldValue('avatar', `${isLocal ? localUrl : icUrl}`);
	// }, [file])

	// const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
	// 	const file = event.target.files?.[0];
	// 	if (file) {
	// 		setFile(file);
	// 	}
	// };

	// const uploadAvatar = async (file: File) => {
	// 	const agent = HttpAgent.createSync({
	// 		host: isLocal ? `http://localhost:${window.location.port}` : 'https://ic0.app',
	// 		// identity,
	// 	});
	// 	// if (isLocal) {
	// 	// 	agent.fetchRootKey();
	// 	// }

	// 	const assetManager = new AssetManager({
	// 		canisterId: ASSET_CANISTER,
	// 		agent: agent
	// 	});

	// 	const result = await assetManager.store(file);

	// 	console.log(result);
	// }

	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Profile</h1>
			</div>
			<div className="font-roboto-condensed bg-secondary rounded-lg shadow-md p-6">
				<div className="mb-6 font-roboto-condensed">Update your profile information below. Your name will be displayed across the platform, and you can set an avatar using a secure HTTPS URL.</div>

				<form
					onSubmit={formik.handleSubmit}
					className="w-3/5 flex flex-col gap-3"
				>
					{error && <span className="text-destructive">{error}</span>}
					<div className="flex flex-col items-start font-roboto-condensed font-medium ">
						<Label htmlFor="username" variant={(formik.errors.username || (availability && !availability.available)  ? "destructive" : "default" )}>
							Username
						</Label>
						<Input
							variant={formik.errors.username ? "destructive" : !availability ? "default" : availability.available ? "constructive" : "destructive"}
							id="username"
							name="username"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.username}
						/>
						<span className="text-destructive text-sm">{formik.errors.username}</span>
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

					<div className="flex flex-col items-start font-roboto-condensed font-medium">
						<Label htmlFor="name" variant={(formik.touched.name && formik.errors.name ? "destructive" : "default" ) }>
							Full Name
						</Label>
						<Input
							variant={(formik.touched.name ? formik.errors.name ? "destructive" : "constructive" : 'default' ) }
							id="name"
							name="name"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.name}
							placeholder="Enter your full name"
						/>
						{formik.touched.name &&
							formik.errors.name && (
								<span className="text-red-400 text-sm">
									{formik.errors.name}
								</span>
							)}
					</div>

					<div className="flex flex-col items-start font-roboto-condensed font-medium">
						<Label htmlFor="avatar" variant={(formik.touched.avatar && formik.errors.avatar ? "destructive" : "default" ) }>
							Avatar URL
						</Label>
						<div className="flex gap-2 w-full">
							<Input
								variant={(formik.touched.avatar ? formik.errors.avatar ? "destructive" : "constructive" : 'default' ) }
								id="avatar"
								name="avatar"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.avatar}
								placeholder="Enter avatar URL or upload image"
							/>

							{/* <input
								type="file"
								ref={fileInputRef}
								onChange={handleFileChange}
								accept="image/*"
								className="hidden"
							/>

							<Button type="button" variant="outline" scale="icon" className="p-0 w-10 h-10 border-gray-400 bg-white text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
								{file ? <img src={URL.createObjectURL(file)} alt="Avatar" className="w-full h-full" /> : <Camera size={18} />}
							</Button> */}
						</div>
						{formik.touched.avatar &&
							formik.errors.avatar && (
								<span className="text-red-400 text-sm">
									{formik.errors.avatar}
								</span>
							)}
					</div>

					<div className="flex flex-col items-start font-roboto-condensed font-medium">
						<div className="flex items-center gap-2">
							<input onChange={formik.handleChange} className="cursor-pointer w-4 h-4" type="checkbox" id="tnc" name="tnc" checked={formik.values.tnc} />
							<Label htmlFor="tnc" variant={(formik.touched.tnc && formik.errors.tnc ? "destructive" : "default" ) }>
								I agree to the terms and conditions
							</Label>
						</div>

						{formik.touched.tnc &&
							formik.errors.tnc && (
								<span className="text-red-400 text-sm">
									{formik.errors.tnc}
								</span>
							)}
					</div>


					<div className="flex justify-start items-center my-5">
						{loading ? (
							<Button type="button" disabled rounded="full">
								<LoaderCircle
									size={18}
									className="animate animate-spin"
								/>
								<span>Saving Profile</span>
							</Button>
						) : (
							<Button type="submit" rounded={"full"} disabled={!formik.dirty}>
								<Save size={18} />
								<span>Save Profile</span>
							</Button>
						)}
					</div>
				</form>
			</div>
		</>
	);
}

export default ProfilePage;
