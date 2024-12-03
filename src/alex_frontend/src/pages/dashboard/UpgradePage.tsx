import React, { useEffect } from "react";
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
			<div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
				<div className="mb-6 text-gray-600 font-roboto-condensed">Become a librarian and you will be able to add your nodes.</div>
				{librarianError && <span className="text-destructive">{librarianError}</span>}
				<form
					onSubmit={formik.handleSubmit}
					className="flex flex-col gap-4"
				>
					<div className="flex-grow font-roboto-condensed text-black">
						<Label>
							Terms and Conditions
						</Label>
						<p className="text-base max-h-60 overflow-auto text-justify leading-5 font-normal pr-1">
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla distinctio hic consequatur atque repudiandae dignissimos magnam corrupti cupiditate non perspiciatis tenetur tempora obcaecati saepe beatae similique laudantium, unde vero. Quis eveniet laborum eum deserunt maiores tempora, libero aliquid cum omnis nemo alias quisquam quod nobis suscipit, eaque possimus natus! Sint optio ullam soluta eaque laboriosam ab consequatur. Assumenda corrupti molestiae provident fugit accusantium soluta repudiandae. Sequi praesentium, accusamus neque sed quis ex id debitis sunt odio facilis eligendi dolores consectetur ea nulla cupiditate necessitatibus quia reiciendis esse atque libero. At ab cupiditate magnam quibusdam reprehenderit quia tenetur amet atque quod! Dicta, accusamus atque laboriosam quisquam non minima quis ipsam. Mollitia quibusdam unde accusamus commodi! Itaque qui obcaecati veniam et hic est nihil facilis cupiditate quia ipsa, delectus minus rerum, eius, voluptas perferendis aliquid provident. Totam dicta fugit deserunt quos ad natus, libero eos vero facilis? Quo beatae aliquid praesentium, illo adipisci, eos suscipit ullam expedita recusandae ab, assumenda placeat fugit consequuntur. Quasi voluptas inventore numquam quia corrupti nobis odit quod, consequatur obcaecati corporis consequuntur molestiae eligendi incidunt ut alias expedita! Tempore voluptatem exercitationem eius. Tempore sunt nihil ipsa non ea, consectetur commodi excepturi est sapiente suscipit ut nesciunt veniam nam porro quasi iure. Earum at dolorem, explicabo, quaerat voluptatem dicta odio ullam unde totam reiciendis facere corporis laboriosam minus possimus. Culpa enim doloremque explicabo incidunt ipsa totam architecto, tempore odio. Quae, odio ex sit labore aut est officiis blanditiis? Voluptate iste neque adipisci aut voluptatem provident perspiciatis, incidunt doloribus ipsam quod nemo cumque quos harum totam nihil tenetur fugit labore veritatis, aspernatur asperiores eum aperiam, quas est. Omnis porro a animi deleniti exercitationem dolorem totam nobis eius alias, sequi rerum provident earum ipsum? Eligendi velit illum maxime architecto excepturi dolorem saepe ea culpa ullam, aliquam officia consequuntur asperiores porro non deleniti labore obcaecati, perferendis expedita natus ipsam voluptates impedit iusto ex error! Iure sed exercitationem eaque eveniet delectus asperiores, et nihil minima consectetur perspiciatis quae inventore obcaecati velit eos ad laudantium expedita, tempora quaerat dicta fugiat necessitatibus. Et porro doloremque doloribus, dolore iste illum eos nesciunt culpa sunt sequi ipsum debitis ratione quas. Quo quam aliquid nam voluptate magnam ea officiis iste repudiandae nostrum voluptatem explicabo veritatis dolorum esse in iusto, commodi voluptas voluptatibus atque. Porro est laboriosam, quae nesciunt eos a saepe? Magnam at, quasi dignissimos nesciunt soluta provident praesentium veritatis nulla dolorem sequi aliquid debitis labore vitae repudiandae aut? Harum sit voluptas libero veritatis repellat expedita quia, alias, incidunt ad perspiciatis vel, ut fugit omnis? Quibusdam eveniet.
						</p>
					</div>

					<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
						<div className="flex items-center gap-2">
							<input onChange={formik.handleChange} className="cursor-pointer w-4 h-4" type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formik.values.agreeToTerms} />
							<Label htmlFor="agreeToTerms" variant={(formik.touched.agreeToTerms && formik.errors.agreeToTerms ? "destructive" : "default" ) }>
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