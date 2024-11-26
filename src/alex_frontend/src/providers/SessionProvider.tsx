import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import SessionContext from '@/contexts/SessionContext';
import MeiliSearch, { Index } from 'meilisearch';
import { initializeClient, initializeIndex } from '@/services/meiliService';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { setEngines } from '@/features/my-engines/myEnginesSlice';


interface SessionProviderProps {
	children: React.ReactNode;
}

// authClient > user > actor > my-engines > [meiliclient, meiliindex]
const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector(state => state.auth);
	const {engines} = useAppSelector(state=>state.myEngines)
	const {activeEngine} = useAppSelector(state=>state.engineOverview)

	const [meiliClient, setMeiliClient] = useState<MeiliSearch>();
	const [meiliIndex, setMeiliIndex] = useState<Index>();

	const initializeMeiliClient = async () => {
		const host = process.env.REACT_MEILI_HOST;
		const key = process.env.REACT_MEILI_KEY;

		const client = await initializeClient(host, key);

		if(client) {
			setMeiliClient(client)

			const index = await initializeIndex(client, user?.principal.toString() || 'anonymous')
			if (index) setMeiliIndex(index)
		}
	}

	useEffect(() => {
		// Setup default meiliclient
		// initializeMeiliClient();

	}, [dispatch]);



	useEffect(() => {
		if(!user) dispatch(setEngines([]));
		// else dispatch(fetchMyEngines());
	}, [user]);


	// // setup meilisearch client when user engines change
	// useEffect(()=>{
	// 	const setupMeili = async()=>{
	// 		const engineAvailable = engines.find(async (engine) => {
	// 			// if engines exist, initialize meilisearch client with engines host and key

	// 			const client = await initializeClient(engine.host, engine.key);
	// 			if(!client) return false;
	// 			setMeiliClient(client)

	// 			const index = await initializeIndex(client, engine.index)
	// 			if(index) setMeiliIndex(index)

	// 			return true;
	// 		})

	// 		if(!engineAvailable){
	// 			initializeMeiliClient();
	// 		}
	// 	}
	// 	setupMeili();
	// },[engines])


	// useEffect(()=>{
	// 	if(activeEngine){
	// 		const updatedEngines = engines.map(engine => engine.id === activeEngine.id ? activeEngine : engine);
	// 		dispatch(setEngines(updatedEngines));
	// 	}
	// },[activeEngine])

	return (
		<SessionContext.Provider value={{ meiliClient, meiliIndex }}>
			{children}
		</SessionContext.Provider>
	);
};

export default SessionProvider