import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import {
	LoaderCircle,
	Save,
	CheckCircle,
	XCircle,
	RotateCcw,
} from "lucide-react";
import useAuthentication from "@/hooks/actors/useAuthentication";
import type { SolanaSettings } from "../../../../../declarations/authentication/authentication.did";

const SolanaSettingsSchema = Yup.object().shape({
	uri: Yup.string()
		.matches(
			/^https?:\/\/.+/,
			"URI must be a valid URL (http:// or https://)"
		)
		.required("URI is required"),
	domain: Yup.string()
		.min(2, "Domain is too short")
		.required("Domain is required"),
	statement: Yup.string()
		.min(10, "Statement is too short")
		.required("Statement is required"),
	salt: Yup.string()
		.min(8, "Salt must be at least 8 characters")
		.required("Salt is required"),
	version: Yup.string().required("Version is required"),
	session_ttl: Yup.number()
		.min(60, "Session TTL must be at least 60 seconds")
		.required("Session TTL is required"),
	message_ttl: Yup.number()
		.min(60, "Message TTL must be at least 60 seconds")
		.required("Message TTL is required"),
	cluster: Yup.string()
		.oneOf(["mainnet-beta", "devnet", "testnet"], "Invalid cluster")
		.required("Cluster is required"),
});

const SolanaSettingsComponent = () => {
	const { actor } = useAuthentication();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Default values matching backend defaults
	const defaultValues = {
		uri: "http://localhost:8080",
		domain: "localhost:8080",
		statement: "Sign in to authenticate with your Solana wallet",
		salt: "solana-mulauth-salt",
		version: "1",
		cluster: "mainnet-beta",
		session_ttl: 28800, // 8 hours in seconds
		message_ttl: 600, // 10 minutes in seconds
	};

	const formik = useFormik({
		initialValues: defaultValues,
		validationSchema: SolanaSettingsSchema,
		validateOnBlur: true,
		validateOnChange: true,
		onSubmit: async (values) => {
			if (!actor) {
				setError("Authentication actor not available");
				return;
			}

			setLoading(true);
			setError(null);
			setSuccess(false);

			try {
				const settings: SolanaSettings = {
					uri: values.uri,
					domain: values.domain,
					statement: values.statement,
					salt: values.salt,
					version: values.version,
					session_ttl: BigInt(values.session_ttl * 1_000_000_000), // Convert seconds to nanoseconds
					message_ttl: BigInt(values.message_ttl * 1_000_000_000), // Convert seconds to nanoseconds
					cluster: values.cluster,
				};

				const result = await actor.update_solana_settings(settings);

				if ("Ok" in result) {
					setSuccess(true);
					setTimeout(() => setSuccess(false), 3000);
				} else {
					setError(result.Err);
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Unknown error occurred"
				);
			} finally {
				setLoading(false);
			}
		},
	});

	const resetMessages = () => {
		setError(null);
		setSuccess(false);
	};

	const resetToDefaults = () => {
		formik.setValues(defaultValues);
		resetMessages();
	};

	return (
		<div className="w-full">
			{success && (
				<div className="mb-4 flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300">
					<CheckCircle size={16} />
					<span className="text-sm font-medium">
						Settings updated successfully
					</span>
				</div>
			)}

			{error && (
				<div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300">
					<XCircle size={16} />
					<span className="text-sm font-medium">{error}</span>
				</div>
			)}

			<div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
					<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
						Solana Authentication
					</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
						Configure SIWS settings for your application
					</p>
				</div>

				<form onSubmit={formik.handleSubmit} className="p-6">
					<div className="space-y-6">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="uri"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Application URI
								</label>
								<Input
									id="uri"
									name="uri"
									value={formik.values.uri}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									onFocus={resetMessages}
									placeholder="https://your-app.com"
									className="text-sm"
									variant={
										formik.touched.uri
											? formik.errors.uri
												? "destructive"
												: "constructive"
											: "default"
									}
								/>
								{formik.touched.uri && formik.errors.uri ? (
									<p className="text-red-500 text-xs mt-1">
										{formik.errors.uri}
									</p>
								) : (
									<p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
										Base URL where your application is
										hosted
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="domain"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Domain
								</label>
								<Input
									id="domain"
									name="domain"
									value={formik.values.domain}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									onFocus={resetMessages}
									placeholder="your-app.com"
									className="text-sm"
									variant={
										formik.touched.domain
											? formik.errors.domain
												? "destructive"
												: "constructive"
											: "default"
									}
								/>
								{formik.touched.domain &&
								formik.errors.domain ? (
									<p className="text-red-500 text-xs mt-1">
										{formik.errors.domain}
									</p>
								) : (
									<p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
										Domain displayed in SIWS authentication
										message
									</p>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor="statement"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Authentication Statement
							</label>
							<textarea
								id="statement"
								name="statement"
								value={formik.values.statement}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								onFocus={resetMessages}
								placeholder="Sign in to authenticate with Solana"
								rows={2}
								className={`w-full text-sm px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 resize-none ${
									formik.touched.statement &&
									formik.errors.statement
										? "border-red-300 dark:border-red-600 focus:ring-red-200 focus:border-red-500"
										: formik.touched.statement &&
											  !formik.errors.statement
											? "border-green-300 dark:border-green-600 focus:ring-green-200 focus:border-green-500"
											: "border-gray-300 dark:border-gray-600 focus:ring-blue-200 focus:border-blue-500"
								}`}
							/>
							{formik.touched.statement &&
							formik.errors.statement ? (
								<p className="text-red-500 text-xs mt-1">
									{formik.errors.statement}
								</p>
							) : (
								<p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
									Message displayed to users during
									authentication process
								</p>
							)}
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div>
								<label
									htmlFor="version"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Version
								</label>
								<Input
									id="version"
									name="version"
									value={formik.values.version}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									onFocus={resetMessages}
									placeholder="1"
									className="text-sm"
									variant={
										formik.touched.version
											? formik.errors.version
												? "destructive"
												: "constructive"
											: "default"
									}
								/>
								{formik.touched.version &&
								formik.errors.version ? (
									<p className="text-red-500 text-xs mt-1">
										{formik.errors.version}
									</p>
								) : (
									<p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
										SIWS protocol version number
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="cluster"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Cluster
								</label>
								<select
									id="cluster"
									name="cluster"
									value={formik.values.cluster}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									onFocus={resetMessages}
									className={`w-full text-sm px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
										formik.touched.cluster &&
										formik.errors.cluster
											? "border-red-300 dark:border-red-600 focus:ring-red-200 focus:border-red-500"
											: formik.touched.cluster &&
												  !formik.errors.cluster
												? "border-green-300 dark:border-green-600 focus:ring-green-200 focus:border-green-500"
												: "border-gray-300 dark:border-gray-600 focus:ring-blue-200 focus:border-blue-500"
									}`}
								>
									<option value="mainnet-beta">
										Mainnet Beta
									</option>
									<option value="devnet">Devnet</option>
									<option value="testnet">Testnet</option>
								</select>
								{formik.touched.cluster &&
								formik.errors.cluster ? (
									<p className="text-red-500 text-xs mt-1">
										{formik.errors.cluster}
									</p>
								) : (
									<p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
										mainnet-beta, devnet, testnet
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="salt"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Salt
								</label>
								<Input
									id="salt"
									name="salt"
									value={formik.values.salt}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									onFocus={resetMessages}
									placeholder="unique_salt"
									className="text-sm"
									variant={
										formik.touched.salt
											? formik.errors.salt
												? "destructive"
												: "constructive"
											: "default"
									}
								/>
								{formik.touched.salt && formik.errors.salt ? (
									<p className="text-red-500 text-xs mt-1">
										{formik.errors.salt}
									</p>
								) : (
									<p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
										Random string for additional security
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="session_ttl"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Session TTL
								</label>
								<div className="relative">
									<Input
										id="session_ttl"
										name="session_ttl"
										type="number"
										value={formik.values.session_ttl}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										onFocus={resetMessages}
										placeholder="3600"
										className="text-sm pr-12"
										variant={
											formik.touched.session_ttl
												? formik.errors.session_ttl
													? "destructive"
													: "constructive"
												: "default"
										}
									/>
									<span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
										sec
									</span>
								</div>
								{formik.touched.session_ttl &&
								formik.errors.session_ttl ? (
									<p className="text-red-500 text-xs mt-1">
										{formik.errors.session_ttl}
									</p>
								) : (
									<p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
										How long user sessions remain valid
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="message_ttl"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Message TTL
								</label>
								<div className="relative">
									<Input
										id="message_ttl"
										name="message_ttl"
										type="number"
										value={formik.values.message_ttl}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										onFocus={resetMessages}
										placeholder="300"
										className="text-sm pr-12"
										variant={
											formik.touched.message_ttl
												? formik.errors.message_ttl
													? "destructive"
													: "constructive"
												: "default"
										}
									/>
									<span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
										sec
									</span>
								</div>
								{formik.touched.message_ttl &&
								formik.errors.message_ttl ? (
									<p className="text-red-500 text-xs mt-1">
										{formik.errors.message_ttl}
									</p>
								) : (
									<p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
										How long authentication messages remain
										valid
									</p>
								)}
							</div>
						</div>
					</div>

					<div className="flex justify-start gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
						<Button
							type="submit"
							disabled={loading}
							className="flex items-center gap-2"
						>
							{loading ? (
								<>
									<LoaderCircle
										size={16}
										className="animate-spin"
									/>
									Updating...
								</>
							) : (
								<>
									<Save size={16} />
									Update Settings
								</>
							)}
						</Button>

						<Button
							type="button"
							variant="muted"
							onClick={resetToDefaults}
							disabled={loading}
							className="flex items-center gap-2"
						>
							<RotateCcw size={16} />
							Reset to Defaults
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SolanaSettingsComponent;
