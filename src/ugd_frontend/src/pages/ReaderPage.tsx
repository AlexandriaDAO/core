import React from "react";
import MainLayout from "@/layouts/MainLayout";
import BookModal from "@/components/BookModal";
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
