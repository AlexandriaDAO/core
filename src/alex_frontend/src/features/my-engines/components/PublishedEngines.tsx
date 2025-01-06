import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/lib/components/table";
import { NavLink } from "react-router";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useUser } from "@/hooks/actors";
import { toast } from "sonner";
import { SerializedEngine, setUpdating } from "../myEnginesSlice";
import updateEngineStatus from "../thunks/updateEngineStatus";
import { LoaderCircle } from "lucide-react";


function PublishedEngines() {
	const { engines, updating } = useAppSelector((state) => state.myEngines);

    const dispatch = useAppDispatch();
    const {actor} = useUser();


    const handleMoveToDraftClick = (engine: SerializedEngine)=>{
        dispatch(setUpdating(engine.id))
    }

    useEffect(()=>{
        if(updating === '') return;

        if(!actor) {
            toast('Failed, Try later!!!')
            return;
        }

        dispatch(updateEngineStatus({actor, id: updating, active: false}))
    },[updating, actor, dispatch])



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
                        <TableCell className="text-center flex justify-center items-center gap-2">
                            <NavLink to={'/dashboard/engines/'+engine.id}>
                                <Button variant="link" scale="sm">View Engine</Button>
                            </NavLink>
                            {updating === engine.id ?
                                <Button variant='inverted' scale="sm" disabled>
                                    <span>Drafting...</span>
                                    <LoaderCircle size={20} className="animate animate-spin" />
                                </Button>:
                                <Button variant='inverted' scale="sm" onClick={()=>handleMoveToDraftClick(engine)}>
                                    Move To Draft
                                </Button>
                            }

                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
	);
}

export default PublishedEngines;
