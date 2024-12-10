import React, { useEffect } from "react";
import { Button } from "@/lib/components/button";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router";
import Collection from "@/features/collection";
import useNftManager from "@/hooks/actors/useNftManager";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchMyBooks from "@/features/collection/thunks/fetchMyBooks";

function CollectionPage() {
	const {actor} = useNftManager();
	const dispatch = useAppDispatch();

	const { user } = useAppSelector((state) => state.auth);

	useEffect(() => {
		if(!actor || !user) return;
		dispatch(fetchMyBooks({actor, user}));
	}, [user, dispatch]);

	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">My Collection</h1>
				<Link to="/app/emporium/">
					<Button variant='link' scale="sm" className="flex justify-between gap-2 items-center">
						<ShoppingBag size={18}/>
						<span>Visit Shop Page</span>
					</Button>
				</Link>
			</div>
			<div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
				<div className="mb-6 text-gray-600 font-roboto-condensed">list of your minted NFTs</div>
				<Collection />
			</div>
		</>
	);
}

export default CollectionPage;