import React from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Button } from "@/lib/components/button";
import { useUser } from "@/hooks/actors";
import { toast } from "sonner";
import { setActiveEngine } from "../engineOverviewSlice";
import updateEngineStatus from "../thunks/updateEngineStatus";

function OverviewActions() {
	const dispatch = useAppDispatch();
    const {actor} = useUser();

	const { activeEngine, loading } = useAppSelector(
		(state) => state.engineOverview
	);

    if(!activeEngine) return <>No Engine Selected</>

    const { user } = useAppSelector(state => state.auth);

    const handleMoveToDraftClick = ()=>{
        if(!activeEngine || !actor) {
            toast('Failed, Try later!!!')
            return;
        }
        dispatch(updateEngineStatus({actor, id: activeEngine.id, active: false}))
    }

    const handlePublishEngine = ()=>{
        if(!activeEngine || !actor) {
            toast('Failed, Try later!!!')
            return;
        }
        dispatch(updateEngineStatus({actor, id: activeEngine.id, active: true}))
    }

	return (
        <div className="flex items-center">
            {user!.principal == activeEngine.owner && <>
                { activeEngine.active &&
                    <Button variant='muted' disabled={loading} onClick={handleMoveToDraftClick}>
                        Move To Draft
                    </Button>
                }
                { !activeEngine.active &&
                    <Button variant='muted' disabled={loading} onClick={handlePublishEngine}>
                        Publish Engine
                    </Button>
                }
            </>}
        </div>
	);
}

export default OverviewActions;


