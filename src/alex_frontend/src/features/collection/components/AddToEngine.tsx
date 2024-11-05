import React, { useEffect, useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { Button } from "@/lib/components/button";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Book } from "@/features/portal/portalSlice";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import EngineRow from "./EngineRow";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import fetchMyEngines from "@/features/my-engines/thunks/fetchMyEngines";
import { Engine } from "../../../../../../src/declarations/alex_backend/alex_backend.did";

interface IAddToEngineProps {
    book?: Book;
};

const AddToEngine: React.FC<IAddToEngineProps> = ({
    book
}: IAddToEngineProps) => {
    if(!book) return <></>

	const dispatch = useAppDispatch();
	const [publishedEngines, setPublishedEngines] = useState<Engine[]>([])

	const {engines, loading}  = useAppSelector(state => state.myEngines)

	useEffect(() => {
		dispatch(fetchMyEngines());
	}, []);

	useEffect(() => {
		setPublishedEngines(engines.filter((engine) => 'Published' in engine.status ));
	}, [engines]);

    return (
		<div onClick={e=>e.stopPropagation()}>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline" scale="icon" rounded="full" className="absolute top-2 right-2 p-0">
						<Plus size={26}/>
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Select Engine</DialogTitle>
						<DialogDescription>Where this book should be added, Choose an Engine.</DialogDescription>
					</DialogHeader>
					<section className="flex-grow h-full overflow-auto w-full flex flex-col">
						<main className="grid min-h-full place-items-center bg-white py-4">
							<div className="flex flex-col gap-1 w-full">
								<div className="flex justify-between items-center">
									<span className="mb-3 text-md leading-7 font-semibold text-gray-600">
										Your Published Engines.
									</span>
								</div>
								<div className="text-center overflow-auto max-h-[300px] w-full bg-gray-100 border shadow rounded">
									<table className="min-w-full border-collapse w-full">
										<thead>
											<tr>
												<th className="p-2">ID</th>
												<th className="p-2">Owner</th>
												<th className="p-2">Action</th>
											</tr>
										</thead>
										<tbody>
											{loading ? (
												<tr>
													<td colSpan={5} className="text-center p-4">
														<div className="flex items-center justify-center gap-1">
															<span className="text-md">Loading Engines</span>
															<LoaderCircle size={12} className="animate-spin inline-block mr-2" />
														</div>
													</td>
												</tr>
											) : publishedEngines.length === 0 ? (
												<tr>
													<td colSpan={5} className="text-center p-4">
														<span className="text-md">You do not have any Published Engines.</span>
													</td>
												</tr>
											) : (
												publishedEngines.map((engine) => <EngineRow key={engine.id} book={book} engine={engine} />)
											)}
										</tbody>
									</table>
								</div>
							</div>
						</main>
					</section>
				</DialogContent>
			</Dialog>
		</div>
    );
}

export default AddToEngine;