import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import languages from "@/data/languages";
import { Label } from "@/lib/components/label";
import { Input } from "@/lib/components/input";
import DDC from "@/data/categories";
import eras from "@/data/eras";
import { Button } from "@/lib/components/button";
import { DialogClose } from "@/lib/components/dialog";
import { LoaderCircle } from "lucide-react";
import { useUploader } from "@/hooks/useUploader";
import { createDataTransaction } from "@/services/uploadService";
import { toast } from "sonner";
import OpagueHolder from "@/features/upload/components/OpagueHolder";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setLoading, setOpen } from "../../uploadSlice";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { nextScreen, previousScreen } from "../../uploadSlice";

const MetadataSchema = Yup.object().shape({
	title: Yup.string()
		.min(4, "Title must be at least 4 characters long")
		.max(150, "Title cannot exceed 150 characters")
		.required("Title is required"),
	creator: Yup.string()
		.min(2, "Creator name must be at least 2 characters long")
		.max(100, "Creator name cannot exceed 100 characters")
		.required("Creator name is required"),
	fiction: Yup.boolean().required("Please select Content Type"),
	language: Yup.string().required("Please select a Language"),
	type: Yup.number()
        .min(0, "Valid Type is required")
        .max(9, "Valid Type is required")
        .required("Please select a Type"),
	categories: Yup.array()
		.of(Yup.number())
		.length(3, "Please select exactly 3 categories")
		.required("Please select categories"),
	era: Yup.number().required("Please select an era"),
});

const MetaData = () => {
	const dispatch = useAppDispatch();
	const { irys, metadata, asset, setMetadata, setAsset} = useUploader()
	const { loading } = useAppSelector(state=>state.upload);

	const formik = useFormik({
		initialValues: {
			title: "",
			creator: "",
			fiction: false,
			language: "en",
			type: 0,
			categories: [] as number[],
			era: 10,
		},
		validationSchema: MetadataSchema,
		validateOnBlur: true,
		validateOnChange: true,
		validateOnMount: true,
		onSubmit: async (values) => {
			try {
				dispatch(setLoading(true));

				if (!irys) {
					toast.info('Irys is not available')
					return;
				}

				// Create a JSON string from the values
				const data = JSON.stringify(values, null, 2);

				const tx = await createDataTransaction(data, irys);

				setMetadata(tx);
			} catch (error) {
				toast.error('Failed to create metadata transaction');
				console.error(`Error: `, error);
				setMetadata(null);
			}finally{
				dispatch(setLoading(false))
			}
		},
	});

	useEffect(() => {
        if (metadata) dispatch(nextScreen());
        if (!asset) dispatch(previousScreen());
    }, [metadata, asset, dispatch]);

	const handleSubcategoryChange = (subcategory: number) => {
        const currentCategories = [...formik.values.categories];
        if (currentCategories.includes(subcategory)) {
            formik.setFieldValue('categories', currentCategories.filter((sc) => sc !== subcategory));
        } else if (currentCategories.length < 3) {
            formik.setFieldValue('categories', [...currentCategories, subcategory]);
        }
    };

	return (
		<form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
			<OpagueHolder loading={loading}>
				<div className="flex flex-col text-sm gap-2 items-start justify-start">
					<div className="flex flex-col gap-1 w-full justify-between items-start">
						<Label
							htmlFor="title"
							scale="md"
							variant={
								formik.touched.title && formik.errors.title
									? "destructive"
									: "default"
							}
						>
							Title
						</Label>
						<Input
							scale="md"
							variant={
								formik.touched.title
									? formik.errors.title
										? "destructive"
										: "constructive"
									: "default"
							}
							id="title"
							name="title"
							placeholder="Image Title"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.title}
							maxLength={150}
						/>
						{formik.touched.title && formik.errors.title && (
							<p className="text-red-500 text-sm mt-1">
								{formik.errors.title}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-1 w-full justify-between items-start">
						<Label
							htmlFor="creator"
							scale="md"
							variant={
								formik.touched.creator &&
								formik.errors.creator
									? "destructive"
									: "default"
							}
						>
							Creator
						</Label>
						<div className="flex gap-2 w-full">
							<div className="flex-1">
								<Input
									scale="md"
									variant={
										formik.touched.creator
											? formik.errors.creator
												? "destructive"
												: "constructive"
											: "default"
									}
									id="creator"
									name="creator"
									placeholder="Creator Name"
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.creator}
									maxLength={100}
								/>
								{formik.touched.creator &&
									formik.errors.creator && (
										<p className="text-red-500 text-sm mt-1">
											{formik.errors.creator}
										</p>
									)}
							</div>

						</div>
					</div>

					<div className="flex flex-col gap-2 w-full">
						<Label
							variant={
								formik.touched.fiction && formik.errors.fiction
									? "destructive"
									: "default"
							}
							scale="md"
						>
							Content Type
						</Label>
						<div className="flex items-center gap-6">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="fiction"
									checked={formik.values.fiction === true}
									onChange={() => formik.setFieldValue("fiction", true)}
									className="w-4 h-4 text-blue-600"
								/>
								<span>Fiction</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="fiction"
									checked={formik.values.fiction === false}
									onChange={() => formik.setFieldValue("fiction", false)}
									className="w-4 h-4 text-blue-600"
								/>
								<span>Non-Fiction</span>
							</label>
						</div>
						{formik.touched.fiction && formik.errors.fiction && (
							<p className="text-red-500 text-sm mt-1">
								{formik.errors.fiction}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-1 w-full justify-between items-start">
						<Label
							htmlFor="type"
							scale="md"
							variant={formik.touched.type && formik.errors.type ? "destructive" : "default"}
						>
							Type
						</Label>
						<select
							id="type"
							name="type"
							value={formik.values.type}
							onChange={(e) => {
								const value = parseInt(e.target.value);
								formik.setFieldValue('type', value);
								formik.setFieldValue('categories', []);
								formik.validateField('type').then(() => {
									formik.setFieldTouched('type', true, true);
								});
							}}
							onBlur={formik.handleBlur}
							className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
						>
							<option value="-1">Select a Type</option>
							{Object.entries(DDC).map(([key, value]) => (
								<option key={key} value={parseInt(key)}>
									{value.type}
								</option>
							))}
						</select>

						{formik.touched.type && formik.errors.type && (
							<p className="text-red-500 text-sm mt-1">{formik.errors.type}</p>
						)}
					</div>

					{typeof formik.values.type === 'number' &&
					formik.values.type >= 0 &&
					formik.values.type <= 9 && (
						<div className="flex flex-col gap-1 w-full">
							<Label
								scale="md"
								variant={formik.touched.categories && formik.errors.categories ? "destructive" : "default"}
							>
								Categories (Select exactly 3)
							</Label>
							<div className="grid grid-cols-2 gap-2 py-2">
								{Object.entries(DDC[formik.values.type]?.category || {}).map(([key, value]) => (
									<div key={key} className="flex items-start gap-2">
										<input
											type="checkbox"
											id={`subtype-${key}`}
											checked={formik.values.categories.includes(parseInt(key, 10))}
											onChange={() => handleSubcategoryChange(parseInt(key, 10))}
											disabled={
												formik.values.categories.length >= 3 &&
												!formik.values.categories.includes(parseInt(key, 10))
											}
											className="rounded border-gray-300 mt-1 cursor-pointer"
										/>
										<label htmlFor={`subtype-${key}`} className="text-sm cursor-pointer">
											{value}
										</label>
									</div>
								))}
							</div>
							{formik.touched.categories && formik.errors.categories && (
								<p className="text-red-500 text-sm mt-1">{formik.errors.categories}</p>
							)}
						</div>
					)}

					<div className="flex flex-col gap-1 w-full justify-between items-start">
						<Label
							htmlFor="era"
							scale="md"
							variant={formik.touched.era && formik.errors.era ? "destructive" : "default"}
						>
							Historical Era
						</Label>
						<select
							id="era"
							name="era"
							value={formik.values.era}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
						>
							<option value="">Select an Era</option>
							{eras.map((era) => (
								<option key={era.value} value={era.value}>
									{era.label}
								</option>
							))}
						</select>
						{formik.touched.era && formik.errors.era && (
							<p className="text-red-500 text-sm mt-1">{formik.errors.era}</p>
						)}
					</div>


					<div className="flex flex-col gap-1 w-full justify-between items-start">
						<Label
							htmlFor="language"
							scale="md"
							variant={
								formik.touched.language && formik.errors.language
									? "destructive"
									: "default"
							}
						>
							Language
						</Label>
						<select
							id="language"
							name="language"
							value={formik.values.language}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
						>
							<option value="">Select a language</option>
							{languages.map((lang) => (
								<option key={lang.code} value={lang.code}>
									{lang.name}
								</option>
							))}
						</select>
						{formik.touched.language && formik.errors.language && (
							<p className="text-red-500 text-sm mt-1">
								{formik.errors.language}
							</p>
						)}
					</div>

				</div>
			</OpagueHolder>

			<footer className="flex justify-between items-center">
				<div className="flex justify-start gap-2 items-center">
					{loading ?
                        <Button type="button" disabled={true} variant="inverted">
                            <LoaderCircle
                                size={18}
                                className="animate animate-spin"
                            />
                            <span>
                                Processing...
                            </span>
                        </Button>:
						<Button
							type="submit"
							disabled={!formik.isValid}
							variant={!formik.isValid ? "inverted" : "info"}
							>
							Submit
						</Button>
					}
					<Button
						type="button"
						variant="secondary"
						onClick={() => setAsset(null)}
					>
						Previous
					</Button>
				</div>

				<DialogClose asChild>
					<Button onClick={()=>dispatch(setOpen(false))} type="button" variant="outline">Close</Button>
				</DialogClose>
			</footer>
		</form>
	);
}

export default MetaData;
