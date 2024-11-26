import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/lib/components/table";
import { NavLink } from "react-router-dom";
import { Button } from "@/lib/components/button";


function PublishedEngines() {
	const { engines } = useAppSelector((state) => state.myEngines);

	return (
        <Table className="font-medium text-md">
            <TableCaption>A list of your Published Engines.</TableCaption>
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
	);
}

export default PublishedEngines;
