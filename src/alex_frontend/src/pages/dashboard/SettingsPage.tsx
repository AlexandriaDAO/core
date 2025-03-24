import React, { useEffect } from "react";
import LibrarianCard from "@/components/LibrarianCard";
import CanisterCard from "@/components/CanisterCard";

function SettingsPage() {
	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Settings</h1>
			</div>
			<div className="font-roboto-condensed bg-secondary rounded-lg shadow-md p-6">
				<div className="mb-6 font-roboto-condensed">Here you can manage your account settings.</div>

				<div className="flex flex-col gap-4">
					<LibrarianCard />
					<CanisterCard />
				</div>
			</div>
		</>
	);
}

export default SettingsPage;