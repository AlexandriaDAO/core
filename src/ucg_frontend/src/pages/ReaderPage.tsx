import React from "react";
import MainLayout from "src/ucg_frontend/src/layouts/MainLayout";
import BookModal from "src/ucg_frontend/src/components/BookModal";
function ReaderPage() {
	return (
		<MainLayout>
			<div className="flex-grow p-6">
				<BookModal />
			</div>
		</MainLayout>
	);
}

export default ReaderPage;
