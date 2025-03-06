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
						As a librarian, you can create and manage wallets that users can use to upload files.
						You'll earn LBRY credits for providing this service.
					</p>
				</div>
			</div>
		</>
	)
}

export default LibrarianPage;