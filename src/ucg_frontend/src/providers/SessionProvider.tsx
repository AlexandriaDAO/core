import React, { useEffect, useState } from 'react';
import { createActor, ucg_backend } from '../../../declarations/ucg_backend';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { useAppSelector } from 'src/ucg_frontend/src/store/hooks/useAppSelector';
import SessionContext from 'src/ucg_frontend/src/contexts/SessionContext';
import MeiliSearch, { Index } from 'meilisearch';
import { initializeClient, initializeIndex } from 'src/ucg_frontend/src/services/meiliService';
import { setUser } from 'src/ucg_frontend/src/features/auth/authSlice';
import fetchMyEngines from 'src/ucg_frontend/src/features/my-engines/thunks/fetchMyEngines';
import { useAppDispatch } from 'src/ucg_frontend/src/store/hooks/useAppDispatch';
import principal from 'src/ucg_frontend/src/features/auth/thunks/principal';
import { initializeActor } from 'src/ucg_frontend/src/features/auth/utils/authUtils';

interface SessionProviderProps {
	children: React.ReactNode;
}

// authClient > user > actor > my-engines > [meiliclient, meiliindex]
const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
	const dispatch = useAppDispatch();
	const {user} = useAppSelector(state=>state.auth);
	const {engines} = useAppSelector(state=>state.myEngines)

	const [actor, setActor] = useState(ucg_backend);
	const [authClient, setAuthClient] = useState<AuthClient>();

	const [meiliClient, setMeiliClient] = useState<MeiliSearch>();
	const [meiliIndex, setMeiliIndex] = useState<Index>();


	const initializeAuthClient = async () => {
		const authClient = await AuthClient.create();
		setAuthClient(authClient);
	}

	useEffect(()=>{
		initializeAuthClient()
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
		if(engines.length <1 ) {
			setMeiliClient(undefined);
			return;
		}
		const setupMeili = async()=>{
			engines.find(async (engine) => {
				const client = await initializeClient(engine.host, engine.key);
				if(!client) return false;

				setMeiliClient(client)

				const index = await initializeIndex(client, engine.index)
				if(index){
					setMeiliIndex(index)
				}

				return true;
			})
		}
		setupMeili();
	},[engines])


	useEffect(() => {
		if (actor!=ucg_backend){
			dispatch(fetchMyEngines(actor));
		}
	}, [actor]);

	return (
		<SessionContext.Provider value={{ actor, authClient, meiliClient, meiliIndex  }}>
			{children}
		</SessionContext.Provider>
	);
};

export default SessionProvider