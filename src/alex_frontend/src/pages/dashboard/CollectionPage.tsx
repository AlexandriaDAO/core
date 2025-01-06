import React from "react";
import { Button } from "@/lib/components/button";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { MintedImages, MintedAudios, MintedVideos, MintedBooks } from "@/features/collection";

function CollectionPage() {
	// const {actor} = useNftManager();
	// const dispatch = useAppDispatch();

	// const { user } = useAppSelector((state) => state.auth);

	// useEffect(() => {
	// 	if(!actor || !user) return;
	// 	dispatch(fetchMyBooks({actor, user}));
	// }, [user, dispatch]);

	// return (
	// 	<>
	// 		<div className="flex justify-between items-center mb-8">
	// 			<h1 className="text-3xl font-bold">My Collection</h1>
	// 			<Link to="/app/emporium/">
	// 				<Button variant='link' scale="sm" className="flex justify-between gap-2 items-center">
	// 					<ShoppingBag size={18}/>
	// 					<span>Visit Shop Page</span>
	// 				</Button>
	// 			</Link>
	// 		</div>
	// 		<div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
	// 			<div className="mb-6 text-gray-600 font-roboto-condensed">list of your minted NFTs</div>
	// 			<Collection />
	// 		</div>
	// 	</>
	// );


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
				<div className="mb-6 text-gray-600 font-roboto-condensed">List of my nfts</div>

				<Tabs defaultValue="images" className="">
					<TabsList>
						<TabsTrigger value="images">Images</TabsTrigger>
						<TabsTrigger value="videos">Videos</TabsTrigger>
						<TabsTrigger value="audios">Audios</TabsTrigger>
						<TabsTrigger value="books">Books</TabsTrigger>
					</TabsList>
					<TabsContent value="images" className="my-6"><MintedImages /></TabsContent>
					<TabsContent value="videos" className="my-6"><MintedVideos /></TabsContent>
					<TabsContent value="audios" className="my-6"><MintedAudios /></TabsContent>
					<TabsContent value="books" className="my-6"><MintedBooks /></TabsContent>
				</Tabs>
			</div>
		</>
	);
}

export default CollectionPage;