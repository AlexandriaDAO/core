import React from "react";

function DashboardPage() {
	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Home</h1>
			</div>
			<div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
				<div className="mb-6 text-gray-600 font-roboto-condensed">General Information</div>
			</div>
		</>
		// <div className="flex justify-between items-center mb-8">
		// 	<h1 className="text-3xl font-bold">{title}</h1>
		// 	{action}
		// </div>
		// <div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
		// 	{description && <div className="mb-6 text-gray-600 font-roboto-condensed">{description}</div>}

		// 	{children}
		// </div>


		// <DashboardLayout
		// 	title="Home"
		// 	description="General Information"
		// >

		// 	<>General Overview</>
		// </DashboardLayout>
	);
}

export default DashboardPage;