import React from "react";
import { message } from "antd";
import { useFormik } from "formik";
import { LiaSaveSolid } from "react-icons/lia";
import * as Yup from "yup";
import useSession from "@/hooks/useSession";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import logout from "@/features/auth/thunks/logout";
import becomeLibrarian from "../thunks/becomeLibrarian";
import { getAuthClient } from "@/features/auth/utils/authUtils";

const LibrarianSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Name is too short")
		.max(50, "Name is too long")
		.required("Librarian Name is required"),
	agreeToTerms: Yup.boolean()
		.oneOf([true], "You must agree to the terms and conditions")
		.required("Agreement is required"),});

const LibrarianForm = () => {
	const dispatch = useAppDispatch();

	const formik = useFormik({
		initialValues: {
			name: "",
			agreeToTerms: false,
		},
		validationSchema: LibrarianSchema,
		validateOnBlur: true, // Validate form field on blur
		validateOnChange: true, // Validate form field on change
		onSubmit: async (values) => {
			const client = await getAuthClient();
			if (client) {
				if (await client.isAuthenticated()) {
					dispatch(becomeLibrarian(values));
				} else {
					message.error('Login to apply');
					dispatch(logout(client));
				}
			}
		},
	});

	return (
		<>
			<span className="font-syne text-xl font-bold">
				Become Librarian
			</span>

			<form
				onSubmit={formik.handleSubmit}
				className="flex flex-col gap-4"
			>
				<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
					<label className="text-lg" htmlFor="name">
						Name
					</label>
					<input
						className={`w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-xl ${
							formik.touched.name &&
							formik.errors.name
								? "border-red-500"
								: ""
						}`}
						id="name"
						name="name"
						type="text"
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
				<div className="flex-grow font-roboto-condensed text-black">
					<label className="text-lg font-medium">
						Terms and Conditions
					</label>
					<p className="text-base max-h-60 overflow-auto text-justify leading-5 font-normal">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla distinctio hic consequatur atque repudiandae dignissimos magnam corrupti cupiditate non perspiciatis tenetur tempora obcaecati saepe beatae similique laudantium, unde vero. Quis eveniet laborum eum deserunt maiores tempora, libero aliquid cum omnis nemo alias quisquam quod nobis suscipit, eaque possimus natus! Sint optio ullam soluta eaque laboriosam ab consequatur. Assumenda corrupti molestiae provident fugit accusantium soluta repudiandae. Sequi praesentium, accusamus neque sed quis ex id debitis sunt odio facilis eligendi dolores consectetur ea nulla cupiditate necessitatibus quia reiciendis esse atque libero. At ab cupiditate magnam quibusdam reprehenderit quia tenetur amet atque quod! Dicta, accusamus atque laboriosam quisquam non minima quis ipsam. Mollitia quibusdam unde accusamus commodi! Itaque qui obcaecati veniam et hic est nihil facilis cupiditate quia ipsa, delectus minus rerum, eius, voluptas perferendis aliquid provident. Totam dicta fugit deserunt quos ad natus, libero eos vero facilis? Quo beatae aliquid praesentium, illo adipisci, eos suscipit ullam expedita recusandae ab, assumenda placeat fugit consequuntur. Quasi voluptas inventore numquam quia corrupti nobis odit quod, consequatur obcaecati corporis consequuntur molestiae eligendi incidunt ut alias expedita! Tempore voluptatem exercitationem eius. Tempore sunt nihil ipsa non ea, consectetur commodi excepturi est sapiente suscipit ut nesciunt veniam nam porro quasi iure. Earum at dolorem, explicabo, quaerat voluptatem dicta odio ullam unde totam reiciendis facere corporis laboriosam minus possimus. Culpa enim doloremque explicabo incidunt ipsa totam architecto, tempore odio. Quae, odio ex sit labore aut est officiis blanditiis? Voluptate iste neque adipisci aut voluptatem provident perspiciatis, incidunt doloribus ipsam quod nemo cumque quos harum totam nihil tenetur fugit labore veritatis, aspernatur asperiores eum aperiam, quas est. Omnis porro a animi deleniti exercitationem dolorem totam nobis eius alias, sequi rerum provident earum ipsum? Eligendi velit illum maxime architecto excepturi dolorem saepe ea culpa ullam, aliquam officia consequuntur asperiores porro non deleniti labore obcaecati, perferendis expedita natus ipsam voluptates impedit iusto ex error! Iure sed exercitationem eaque eveniet delectus asperiores, et nihil minima consectetur perspiciatis quae inventore obcaecati velit eos ad laudantium expedita, tempora quaerat dicta fugiat necessitatibus. Et porro doloremque doloribus, dolore iste illum eos nesciunt culpa sunt sequi ipsum debitis ratione quas. Quo quam aliquid nam voluptate magnam ea officiis iste repudiandae nostrum voluptatem explicabo veritatis dolorum esse in iusto, commodi voluptas voluptatibus atque. Porro est laboriosam, quae nesciunt eos a saepe? Magnam at, quasi dignissimos nesciunt soluta provident praesentium veritatis nulla dolorem sequi aliquid debitis labore vitae repudiandae aut? Harum sit voluptas libero veritatis repellat expedita quia, alias, incidunt ad perspiciatis vel, ut fugit omnis? Quibusdam eveniet.
					</p>
				</div>

				<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
					<div className="flex items-center gap-2">
						<input onChange={formik.handleChange} className="cursor-pointer w-4 h-4" type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formik.values.agreeToTerms} />
						<label className="cursor-pointer text-lg" htmlFor="agreeToTerms">I agree to the terms and conditions</label>
					</div>

					{formik.touched.agreeToTerms &&
						formik.errors.agreeToTerms && (
							<span className="text-red-400 text-sm">
								{formik.errors.agreeToTerms}
							</span>
						)}
				</div>
				<button
					type="submit"
					className="w-44 py-3 self-center my-4 flex gap-2 justify-center items-center border border-black rounded-full font-roboto-condensed text-base leading-[18px] font-medium transition-all duration-100 ease-in text-black cursor-pointer hover:bg-black hover:text-white"
				>
					<LiaSaveSolid size={18} />
					<span>Save Form</span>
				</button>
			</form>
		</>
	);
};

export default LibrarianForm;