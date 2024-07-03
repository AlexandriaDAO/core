// src/ucg_frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createActor as createUcgActor, ucg_backend } from '../../../declarations/ucg_backend';
import { createActor as createIcrc7Actor, icrc7 } from '../../../declarations/icrc7';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { Principal } from '@dfinity/principal';
import { AccountIdentifier, LedgerCanister } from '@dfinity/ledger-icp';

interface AuthContextProps {
  ucgActor: any;
  icrc7Actor: any;
  UID: Principal | null;
  accountIdentifier: AccountIdentifier | null;
  balanceE8s: bigint | null;
  login: (e: React.FormEvent) => Promise<void>;
  logout: (e: React.FormEvent) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  ucgActor: ucg_backend,
  icrc7Actor: icrc7,
  UID: null,
  accountIdentifier: null,
  balanceE8s: null,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

const LEDGER_CANISTER_ID = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [ucgActor, setUcgActor] = useState(ucg_backend);
  const [icrc7Actor, setIcrc7Actor] = useState(icrc7);
  const [UID, setUID] = useState<Principal | null>(null);
  const accountIdentifier = useMemo(() => UID && AccountIdentifier.fromPrincipal({ principal: UID }), [UID]);
  const [balanceE8s, setBalanceE8s] = useState<bigint | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (accountIdentifier) {
        const ledger = LedgerCanister.create({ canisterId: LEDGER_CANISTER_ID });
        const balance = await ledger.accountBalance({ accountIdentifier });
        setBalanceE8s(balance);
        console.log("Balance: ", balance);
      } else {
        setBalanceE8s(null);
      }
    };
  
    fetchBalance();
  }, [accountIdentifier]);

  useEffect(() => {
    const initializeAuth = async () => {
      const authClient = await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();

      if (isAuthenticated) {
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });
        const newUcgActor = createUcgActor(process.env.CANISTER_ID_UCG_BACKEND!, {
          agent,
        });
        const newIcrc7Actor = createIcrc7Actor(process.env.CANISTER_ID_ICRC7!, {
          agent,
        });

        setUcgActor(newUcgActor);
        setIcrc7Actor(newIcrc7Actor);
        setUID(await newUcgActor.whoami());
      }
    };

    initializeAuth();
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    let authClient = await AuthClient.create();

    // start the login process and wait for it to finish
    await new Promise<void>((resolve) => {
      authClient.login({
        identityProvider:
          process.env.DFX_NETWORK === "ic"
            ? "https://identity.ic0.app"
            : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`,
        onSuccess: () => resolve(),
      });
    });

    // At this point we're authenticated, and we can get the identity from the auth client:
    const identity = authClient.getIdentity();
    // Using the identity obtained from the auth client, we can create an agent to interact with the IC.
    const agent = new HttpAgent({ identity });
    // Using the interface description of our webapp, we create actors that we use to call the service methods.
    const newUcgActor = createUcgActor(process.env.CANISTER_ID_UCG_BACKEND!, {
      agent,
    });
    const newIcrc7Actor = createIcrc7Actor(process.env.CANISTER_ID_ICRC7!, {
      agent,
    });

    setUcgActor(newUcgActor);
    setIcrc7Actor(newIcrc7Actor);
    setUID(await newUcgActor.whoami());
  };

  const logout = async (e: React.FormEvent) => {
    e.preventDefault();
    let authClient = await AuthClient.create();
    await authClient.logout();
    setUcgActor(ucg_backend);
    setIcrc7Actor(icrc7);
    setUID(null);
  };

  return (
    <AuthContext.Provider value={{ ucgActor, icrc7Actor, UID, accountIdentifier, balanceE8s, login, logout  }}>
      {children}
    </AuthContext.Provider>
  );
};