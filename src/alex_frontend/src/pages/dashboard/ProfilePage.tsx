import React, { useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { LoaderCircle, Save } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import update from "@/features/auth/thunks/update";
import { Label } from "@/lib/components/label";
import { Input } from "@/lib/components/input";
import { Button } from "@/lib/components/button";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import LibrarianCard from "@/components/LibrarianCard";


const ProfileSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name cannot exceed 50 characters'),

	avatar: Yup.string()
		.url('Avatar must be a valid URL')
		.matches(/^https:\/\//, 'Avatar URL must use HTTPS'),

	tnc: Yup.boolean()
		.oneOf([true], "You must agree to the terms and conditions")
		.required("Agreement is required"),
	});

function ProfilePage() {
	const {actor} = useUser();
	const dispatch = useAppDispatch();

	const {user, loading, error} = useAppSelector(state=>state.auth)

	const formik = useFormik({
		initialValues: {
			name: "",
			avatar: "",
			tnc: true,
		},
		validationSchema: ProfileSchema,
		validateOnBlur: true, // Validate form field on blur
		validateOnChange: true, // Validate form field on change
		onSubmit: async (values) => {
			if(!actor) return;
			dispatch(update({actor, input: values}));
		},
	});

	useEffect(()=>{
		if(!user) return;
		if(!formik.dirty) {
			formik.resetForm({values: {name: user.name, avatar: user.avatar, tnc: formik.values.tnc}})
		}else{
			formik.resetForm({values: formik.values})
		}
	}, [user])


	return (
		<DashboardLayout
			title="Profile"
			description="Update your profile information below. Your name will be displayed across the platform, and you can set an avatar using a secure HTTPS URL."
		>
			<div className="flex items-center">
				<form
					onSubmit={formik.handleSubmit}
					className="basis-1/2 flex flex-col gap-3"
				>
					{error && <span className="text-destructive">{error}</span>}
					<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
						<Label htmlFor="username">
							Username
						</Label>
						<Input
							id="username"
							name="username"
							value={"@"+user?.username}
							disabled
						/>
					</div>

					<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
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
						/>
						{formik.touched.name &&
							formik.errors.name && (
								<span className="text-red-400 text-sm">
									{formik.errors.name}
								</span>
							)}
					</div>

					<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
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
							{/* <Dialog>
								<DialogTrigger asChild>
									<div
										className="w-10 h-10 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 flex items-center justify-center"
										onClick={handleAvatarClick}
									>
										<Camera size={18} className="text-gray-500"/>
									</div>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Upload Avatar Image</DialogTitle>
										<DialogDescription>
											Choose an image file to use as your avatar
										</DialogDescription>
									</DialogHeader>
									<div className="grid gap-4 py-4">
										<div className="flex items-center justify-center">
											<input
												type="file"
												ref={fileInputRef}
												onChange={handleFileChange}
												accept="image/*"
												className="hidden"
											/>
											<Button onClick={() => fileInputRef.current?.click()}>
												<Upload className="mr-2 h-4 w-4" />
												Select Image
											</Button>
										</div>
									</div>
								</DialogContent>
							</Dialog> */}
						</div>
						{formik.touched.avatar &&
							formik.errors.avatar && (
								<span className="text-red-400 text-sm">
									{formik.errors.avatar}
								</span>
							)}
					</div>

					<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
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
				<div className="flex-grow flex justify-center items-center w-full h-full">
					<LibrarianCard />
				</div>
			</div>

		</DashboardLayout>
	);
}

export default ProfilePage;
