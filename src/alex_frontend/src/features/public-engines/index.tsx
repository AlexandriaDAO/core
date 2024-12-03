import React from "react";
import { NavLink } from "react-router";
import { useAppSelector } from "@/store/hooks/useAppSelector";

import './styles/table.module.css';
import { LoaderCircle, Search } from "lucide-react";
import { TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow, Table } from "@/lib/components/table";
import { Button } from "@/lib/components/button";

function PublicEngines() {
	const { engines, loading } = useAppSelector((state) => state.publicEngines);

	if(loading) return (
		<div className="flex justify-start items-center gap-1">
			<span>Loading Public Engines</span>
			<LoaderCircle size={20} className="animate animate-spin" />
		</div>
	)

	if(engines.length<=0) return <span>No Engines to display</span>

	return (
		<div className="flex flex-col gap-6">
			<div className="border-b-2 border-solid border-gray-500 flex items-center gap-2 px-2 py-2">
				<Search />
				<input
					type="text"
					placeholder="Search"
					className="font-roboto-condensed font-normal text-base flex-grow rounded border-0 ring-0 focus:ring-0 outline-none"
				/>
			</div>
			<Table className="font-medium text-md">
				<TableCaption>A list of Public Engines.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>Title</TableHead>
						<TableHead>Creator</TableHead>
						<TableHead>Date</TableHead>
						<TableHead className="text-center">Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{engines.map((engine) => engine.active && (
						<TableRow key={engine.id} >
							<TableCell>{engine.title}</TableCell>
							<TableCell>{engine.owner.slice(0, 6) + "..." + engine.owner.slice(-4)}</TableCell>
							<TableCell>{engine.created_at}</TableCell>
							<TableCell className="text-center">
								<NavLink to={'/dashboard/engines/'+engine.id}>
									<Button variant="inverted" scale="sm">View Engine</Button>
								</NavLink>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export default PublicEngines;
