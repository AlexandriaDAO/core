import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/lib/components/table";
import { Button } from "@/lib/components/button";
import { NavLink } from "react-router";
import updateEngineStatus from "../thunks/updateEngineStatus";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useUser } from "@/hooks/actors";
import { SerializedEngine, setUpdating } from "../myEnginesSlice";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";


function DraftedEngines() {
	const { engines, updating } = useAppSelector((state) => state.myEngines);

    const dispatch = useAppDispatch();
    const {actor} = useUser();

    const handlePublishEngine = (engine: SerializedEngine)=>{
        dispatch(setUpdating(engine.id))
    }

    useEffect(()=>{
        if(updating === '') return;

        if(!actor) {
            toast('Failed, Try later!!!')
            return;
        }

        dispatch(updateEngineStatus({actor, id: updating, active: true}))
    },[updating, actor, dispatch])

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
                        <TableCell className="text-center flex justify-center items-center gap-2">
                            <NavLink to={'/dashboard/engines/'+engine.id}>
                                <Button variant="link" scale="sm">View Engine</Button>
                            </NavLink>
                            {updating === engine.id ?
                                <Button variant='inverted' scale="sm" disabled>
                                    <span>Publishing...</span>
                                    <LoaderCircle size={20} className="animate animate-spin" />
                                </Button>:
                                <Button variant='inverted' scale="sm" onClick={()=>handlePublishEngine(engine)}>
                                    Publish Engine
                                </Button>
                            }
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
	);
}

export default DraftedEngines;
