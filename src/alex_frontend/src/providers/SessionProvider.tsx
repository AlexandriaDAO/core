import React, { useEffect, useState } from 'react';
import { alex_backend } from '../../../declarations/alex_backend';
import { AuthClient } from "@dfinity/auth-client";
import { useAppSelector } from '@/store/hooks/useAppSelector';
import SessionContext from '@/contexts/SessionContext';
import MeiliSearch, { Index } from 'meilisearch';
import { initializeClient, initializeIndex } from '@/services/meiliService';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import principal from '@/features/auth/thunks/principal';
import { initializeActor } from '@/features/auth/utils/authUtils';

interface SessionProviderProps {
	children: React.ReactNode;
}

// authClient > user > actor > my-engines > [meiliclient, meiliindex]
const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
	const dispatch = useAppDispatch();
	const {user} = useAppSelector(state=>state.auth);

	const [actor, setActor] = useState(alex_backend);
	const [authClient, setAuthClient] = useState<AuthClient>();

	const [meiliClient, setMeiliClient] = useState<MeiliSearch>();
	const [meiliIndex, setMeiliIndex] = useState<Index>();


	const initializeAuthClient = async () => {
		const authClient = await AuthClient.create();
		setAuthClient(authClient);
	}

	const initializeMeiliClient = async () => {
		const host = process.env.REACT_MEILI_HOST;
		const key = process.env.REACT_MEILI_KEY;

		const client = await initializeClient(host, key);
		// if(client){
		// 	const {results} = await client.getIndexes()
		// 	results.forEach(index=>{
		// 		client.deleteIndexIfExists(index.uid)
		// 	})
		// }
		if(client) setMeiliClient(client)
	}

	useEffect(()=>{
		initializeAuthClient()
		initializeMeiliClient()
	},[])


	useEffect(()=>{
		if(!authClient) return;

		dispatch(principal(authClient))
	},[authClient])

	useEffect(()=>{
		if(!authClient) return;

		const setupActor = async()=>{
			const actor = await initializeActor(authClient);
			setActor(actor)
		}
		setupActor();
	},[user])

	useEffect(()=>{
		setMeiliIndex(undefined)
		if(!user || !meiliClient) return;

		const setupMeiliIndex = async()=>{

			const index = await initializeIndex(meiliClient, user)

			if(index) setMeiliIndex(index)
		}
		setupMeiliIndex();
	},[user, meiliClient])

	return (
		<SessionContext.Provider value={{ actor, authClient, meiliClient, meiliIndex  }}>
			{children}
		</SessionContext.Provider>
	);
};

export default SessionProvider