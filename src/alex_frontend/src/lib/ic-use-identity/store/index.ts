import type { Identity } from "@dfinity/agent";
import {
	type AuthClient,
	IdbStorage,
} from "@dfinity/auth-client";
import { createStore } from "@xstate/store";
import type { Status } from "./../types";

export interface StoreContext {
	providerComponentPresent: boolean;
	authClient?: AuthClient;
	status: Status;
	error?: Error;
	identity?: Identity;
}

type StoreEvent = { type: "setState" } & Partial<StoreContext>;

const initialContext: StoreContext = {
	providerComponentPresent: false,
	authClient: undefined,
	status: "initializing",
	error: undefined,
	identity: undefined,
};

export const store = createStore({
	context: initialContext,
	on: {
		setState: (context, event: StoreEvent) => ({
			...context,
			...event,
		}),
	},
});

export const storage = new IdbStorage();
