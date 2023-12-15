
import { ugd_backend } from '../declarations/ugd_backend';
import { useState, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";

export const useAuth = () => {
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);

  const [UID, setUID] = useState('');

  useEffect(() => {
    const initializeAuthClient = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);

        if (await client.isAuthenticated()) {
          handleAuthenticated(client);
        }
      } catch (error) {
        console.error("Error initializing AuthClient:", error);
      }
    };

    initializeAuthClient();
  }, []);

  const handleLogin = async () => {
    if (!authClient) return;

    authClient.login({
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
      onSuccess: () => handleAuthenticated(authClient),
    });
  };

  const handleAuthenticated = async (client) => {
    const userIdentity = await client.getIdentity();
    setIdentity(userIdentity);

    const userPrincipal = userIdentity.getPrincipal().toString();
    setPrincipal(userPrincipal);

    const userId = await ugd_backend.whoami(userPrincipal);
    setUID(userId);
  };

  const handleLogout = async () => {
    if (!authClient) return;

    await authClient.logout();

    setIdentity(null);
    setPrincipal(null);
    setUID('');

    console.log("User logged out");
  };

  return { authClient, identity, principal, handleLogin, handleLogout, UID };
};

export default useAuth;
