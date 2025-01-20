import React, { Suspense, useEffect } from "react";
import fetchPublicEngines from "@/features/public-engines/thunks/fetchPublicEngines";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

const PublicEngines = React.lazy(()=>import("@/features/public-engines"));

function PublicEnginesPage() {
	const {actor} = useUser();
	const dispatch = useAppDispatch();

	useEffect(() => {
		if(!actor) return;
		dispatch(fetchPublicEngines(actor))
	}, [actor]);

	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Public Engines</h1>
			</div>
			<div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
				<div className="mb-6 text-gray-600 font-roboto-condensed">Explore work of other ambitious users</div>
				<Suspense fallback="Loading public engines">
					<PublicEngines />
				</Suspense>
			</div>
		</>
	);
}

export default PublicEnginesPage;