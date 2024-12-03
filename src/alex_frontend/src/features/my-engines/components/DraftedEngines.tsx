import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/lib/components/table";
import { Button } from "@/lib/components/button";
import { NavLink } from "react-router";


function DraftedEngines() {
	const { engines } = useAppSelector((state) => state.myEngines);

	return (
        <Table className="font-medium text-md">
            <TableCaption>A list of your Drafted Engines.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {engines.map((engine) => !engine.active && (
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
	);
}

export default DraftedEngines;
