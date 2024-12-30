import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import React, { useEffect } from 'react';
import getAllLogs from '../../thunks/insights/getAllLogs';
import { useAppSelector } from '@/store/hooks/useAppSelector';

const Insights = () => {
    const dispatch = useAppDispatch();
    const swap=useAppSelector((state)=>state.swap);

    useEffect(() => {
        dispatch(getAllLogs());
    }, [])

    return (<>
        <h1>Insights</h1>
        
    </>)
}
export default Insights;