// src/ugd_frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createActor, ugd_backend } from '../../../declarations/ugd_backend';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

interface AuthContextProps {
  actor: any;
  UID: string | null;
  login: (e: React.FormEvent) => Promise<void>;
  logout: (e: React.FormEvent) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  actor: ugd_backend,
  UID: null,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [actor, setActor] = useState(ugd_backend);
  const [UID, setUID] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const authClient = await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();

      if (isAuthenticated) {
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });
        const newActor = createActor(process.env.CANISTER_ID_UGD_BACKEND!, {
          agent,
        });

        setActor(newActor);
        setUID(await newActor.whoami());
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
            : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`,
        onSuccess: () => resolve(),
      });
    });

    // At this point we're authenticated, and we can get the identity from the auth client:
    const identity = authClient.getIdentity();
    // Using the identity obtained from the auth client, we can create an agent to interact with the IC.
    const agent = new HttpAgent({ identity });
    // Using the interface description of our webapp, we create an actor that we use to call the service methods.
    const newActor = createActor(process.env.CANISTER_ID_UGD_BACKEND!, {
      agent,
    });

    setActor(newActor);
    setUID(await newActor.whoami());
  };

  const logout = async (e: React.FormEvent) => {
    e.preventDefault();
    let authClient = await AuthClient.create();
    await authClient.logout();
    setActor(ugd_backend);
    setUID(null);
  };

  return (
    <AuthContext.Provider value={{ actor, UID, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};