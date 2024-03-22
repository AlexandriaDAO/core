// src/ugd_frontend/src/utils/AuthProvider.jscreateActor
import { ugd_backend } from '../../../declarations/ugd_backend'
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






























// // // Ultra simple version that we can potentinally move to.



// // src/ugd_frontend/src/utils/AuthProvider.jscreateActor
// import { ugd_backend } from '../../../declarations/ugd_backend'
// import { useState, useEffect } from 'react';
// import { AuthClient } from "@dfinity/auth-client";

// export const useAuth = () => {
//   const [authClient, setAuthClient] = useState(null);
//   const [identity, setIdentity] = useState(null);
//   const [principal, setPrincipal] = useState(null);

//   const [UID, setUID] = useState('');

//   async function updateClient(client) {
//     const isAuthenticated = await client.isAuthenticated();
//     setIsAuthenticated(isAuthenticated);

//     const identity = client.getIdentity();

//     setAuthClient(client);

//     const actor = createActor(canisterId, {
//       agentOptions: {
//         identity,
//       },
//     });

//     setBackendActor(actor);
//   }

//   const handleLogin = () => {
//     if (authClient) {
//       authClient.login({
//         ...options.loginOptions,
//         onSuccess: () => {
//           updateClient(authClient);
//         },
//       });
//     }
//   };
  
//   async function handleLogout() {
//     await authClient?.logout();
//     if (authClient) {
//       await updateClient(authClient);
//     }
//   }
  
//   return { authClient, identity, principal, handleLogin, handleLogout, UID };
// };

// export default useAuth;










































// // Attempt to integrate both styles but failed to get backend functions working.


// // src/ugd_frontend/src/utils/AuthProvider.js
// import { Actor, HttpAgent } from "@dfinity/agent";
// import { canisterId, ugd_backend } from '../../../declarations/ugd_backend'
// import { idlFactory } from '../../../declarations/ugd_backend/index';
// import { useState, useEffect } from 'react';
// import { AuthClient } from "@dfinity/auth-client";

// export const useAuth = () => {
//   const [authClient, setAuthClient] = useState(null);
//   const [identity, setIdentity] = useState(null);
//   const [principal, setPrincipal] = useState(null);
//   const [backendActor, setBackendActor] = useState(ugd_backend);

//   const [UID, setUID] = useState('');

//   useEffect(() => {
//     const initializeAuthClient = async () => {
//       try {
//         const client = await AuthClient.create();
//         setAuthClient(client);

//         if (await client.isAuthenticated()) {
//           handleAuthenticated(client);
//         }
//       } catch (error) {
//         console.error("Error initializing AuthClient:", error);
//       }
//     };

//     initializeAuthClient();
//   }, []);

//   const handleLogin = async () => {
//     if (!authClient) return;

//     authClient.login({
//       maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
//       onSuccess: () => handleAuthenticated(authClient),
//     });
//   };

//   const handleLogout = async () => {
//     if (!authClient) return;

//     await authClient.logout();

//     setIdentity(null);
//     setPrincipal(null);
//     setUID('');

//     console.log("User logged out");
//   };
  
//   const handleAuthenticated = async (client) => {
//     const userIdentity = await client.getIdentity();
//     setIdentity(userIdentity);

//     const userPrincipal = userIdentity.getPrincipal().toString();
//     setPrincipal(userPrincipal);

//     const userId = await ugd_backend.whoami(userPrincipal);
//     setUID(userId);

//     // Create an actor with the user's identity
//     const actor = createActor(canisterId, {
//       agentOptions: {
//         identity: userIdentity,
//       },
//     });
//     setBackendActor(actor);
//   };

//   const createActor = (canisterId, options) => {
//     const agent = new HttpAgent({ ...options.agentOptions });
//     return Actor.createActor(idlFactory, {
//       agent,
//       canisterId,
//     });
//   };

// return { authClient, identity, principal, handleLogin, handleLogout, UID, backendActor };
// };

// export default useAuth;
