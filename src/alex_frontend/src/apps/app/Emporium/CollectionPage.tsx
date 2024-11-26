import React, { useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import useSession from "@/hooks/useSession";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/lib/components/button";
import { useNavigate } from "react-router-dom";
import Collection from "@/features/collection";
import fetchMyBooks from "@/features/collection/thunks/fetchMyBooks";

function CollectionPage() {
	const dispatch = useAppDispatch();

	const { user, loading: userLoading } = useAppSelector((state) => state.auth);
	const { books, loading: collectionLoading } = useAppSelector((state) => state.collection);


	// useEffect(() => {
	// 	dispatch(fetchMyBooks());
	// }, [user, dispatch]);

	if (userLoading) {
		return <LoadingView />;
	} else if (!user) {
		return <LoginRequiredView />;
	} else if (collectionLoading) {
		return <LoadingView />;
	} else if (books.length <= 0) {
		return <EmptyCollectionView />;
	} else {
		return <CollectionDashboard books={books} collectionLoading={collectionLoading} />;
	}
}

function LoadingView() {
	return (
		<MainLayout>
			<div className="flex-grow flex items-center justify-center">
				<LoaderCircle className="animate-spin text-4xl text-primary" />
			</div>
		</MainLayout>
	);
}

function LoginRequiredView() {
	return (
		<MainLayout>
			<div className="flex-grow flex items-center justify-center">
				<div className="bg-white p-8 rounded-xl shadow-lg">
					<h2 className="font-syne text-2xl font-bold mb-4">
						Login Required
					</h2>
					<p className="font-roboto-condensed text-lg">
						Please log in to access the NFT Page.
					</p>
				</div>
			</div>
		</MainLayout>
	);
}

function CollectionDashboard({ books, collectionLoading }: { books: any[], collectionLoading: boolean }) {
	const navigate = useNavigate();

    const handleViewShopClick = () => {
		navigate("/app/emporium/");
	}

	return (
		<MainLayout>
			<div className="flex-grow p-6">
                <div className="my-4 flex justify-between items-center">
                    <div className="font-roboto-condensed font-normal text-xl flex gap-4 items-center">
                        <span> NFTs: {books.length} </span>
                    </div>
					<Button variant='muted' onClick={handleViewShopClick}>
						Visit Shop Page
					</Button>
                </div>
                <Collection />
            </div>
		</MainLayout>
	);
}

function EmptyCollectionView() {
	return (
		<MainLayout>
			<div className="flex-grow flex items-center justify-center">
				<div className="bg-white p-8 rounded-xl shadow-lg">
					<h2 className="font-syne text-2xl font-bold mb-4">
						Empty Collection
					</h2>
					<p className="font-roboto-condensed text-lg">
						Please visit our Shop Page to add assets to your collection.
					</p>
				</div>
			</div>
		</MainLayout>
	);
}

export default CollectionPage;