import React from "react";

function LibrarianPage() {
	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold text-primary">Librarian Home</h1>
			</div>
			<div className="font-roboto-condensed bg-secondary rounded-lg shadow-md p-6">
				<div className="mb-6">
					<h2 className="text-xl font-semibold mb-2">Wallet Management</h2>
					<p className="text-gray-600">
						This is an experimental VetKey feature that shares private keys in exchange for LBRY payments.
						It is only available on a volunteer basis until audited. Reach an admin if you'd like access.
					</p>
				</div>
			</div>
		</>
	)
}

export default LibrarianPage;