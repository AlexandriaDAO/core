// // // OG

// // src/ugd_frontend/src/utils/AuthProvider.jscreateActor
// import { ugd_backend } from '../../../declarations/ugd_backend'
// import { useState, useEffect } from 'react';
// import { AuthClient } from "@dfinity/auth-client";

// export const useAuth = () => {
//   const [authClient, setAuthClient] = useState(null);
//   const [identity, setIdentity] = useState(null);
//   const [principal, setPrincipal] = useState(null);

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
//       // identityProvider: 'https://identity.ic0.app/#authorize',
//       maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
//       // derivationOrigin: 'https://xo3nl-yaaaa-aaaap-abl4q-cai.icp0.io/',
//       // derivationOrigin: 'http://127.0.0.1:4943',
//       // derivationOrigin: 'http://localhost:8080/',
//       // derivationOrigin: 'https://identity.ic0.app/#authorize',
//       onSuccess: () => handleAuthenticated(authClient),
//     });
//   };

//   const handleAuthenticated = async (client) => {
//     const userIdentity = await client.getIdentity();
//     setIdentity(userIdentity);

//     const userPrincipal = userIdentity.getPrincipal().toString();
//     setPrincipal(userPrincipal);

//     const userId = await ugd_backend.whoami(userPrincipal);
//     setUID(userId);
//   };

//   const handleLogout = async () => {
//     if (!authClient) return;

//     await authClient.logout();

//     setIdentity(null);
//     setPrincipal(null);
//     setUID('');

//     console.log("User logged out");
//   };

//   return { authClient, identity, principal, handleLogin, handleLogout, UID };
// };

// export default useAuth;














// let actor = ugd_backend;

// console.log(process.env.CANISTER_ID_INTERNET_IDENTITY);

// const getPrincipal = async () => {
//   try {
//     const UID = await actor.whoami();
//     setUID(UID.toString());
//   } catch (error) {
//     console.error('Error fetching principal:', error);
//   }
// };


// // Addig the actor and envs functions.

// src/ugd_frontend/src/utils/AuthProvider.jscreateActor
import { useEffect, useState } from 'react';
import { createActor, ugd_backend } from '../../../declarations/ugd_backend'
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, Actor } from "@dfinity/agent";

export const useAuth = () => {
  const [actor, setActor] = useState(ugd_backend);
  const [UID, setUID] = useState(null);


  useEffect(() => {
    console.log("UID changed:", UID);
  }, [UID]);

  const login = async (e) => {
    e.preventDefault();

    let authClient = await AuthClient.create();
    
    // start the login process and wait for it to finish
    await new Promise((resolve) => {
      authClient.login({
            identityProvider:
              process.env.DFX_NETWORK === "ic"
                ? "https://identity.ic0.app"
                : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`,
            onSuccess: resolve,
          });
        });

        // At this point we're authenticated, and we can get the identity from the auth client:
        const identity = authClient.getIdentity();
        // Using the identity obtained from the auth client, we can create an agent to interact with the IC.
        const agent = new HttpAgent({ identity });
        // Using the interface description of our webapp, we create an actor that we use to call the service methods.
        const newActor = createActor(process.env.CANISTER_ID_UGD_BACKEND, {
          agent,
        });

        setActor(newActor);
        setUID(await newActor.whoami());
      };
      
    const logout = async (e) => {
      e.preventDefault();
      let authClient = await AuthClient.create();
      await authClient.logout();
      setActor(ugd_backend);
      setUID(null);
    };
        
    return { actor, UID, login, logout };
  };
  
export default useAuth;
    










// Tabs.jsx and intex.tsx use it to get UID
// Keymanager and MeiliSearchClient.tsx use it to get Principal.

// Keymanager and MeiliSearchClient's will be adjusted to not need to use principal for backend calls.


// // // Addig the actor and envs functions.

// // src/ugd_frontend/src/utils/AuthProvider.jscreateActor
// import { useState } from 'react';
// import { createActor, ugd_backend } from '../../../declarations/ugd_backend'
// import { AuthClient } from "@dfinity/auth-client";
// import { HttpAgent, Actor } from "@dfinity/agent";



// export const useAuth = () => {
  
//   const [UID, setUID] = useState('');
//   let actor = ugd_backend;

//   console.log(process.env.CANISTER_ID_INTERNET_IDENTITY);
  
//   const getPrincipal = async () => {
//     try {
//       const UID = await actor.whoami();
//       setUID(UID.toString());
//     } catch (error) {
//       console.error('Error fetching principal:', error);
//     }
//   };

//   const greetButton = document.getElementById("greet");
//   greetButton.onclick = async (e) => {
//     e.preventDefault();
    
//     greetButton.setAttribute("disabled", true);

//     await getPrincipal();
    
//     greetButton.removeAttribute("disabled");

//     document.getElementById("greeting").innerText = UID;
    
//     return false;
//   };

//   const login = document.getElementById("login");
//   login.onclick = async (e) => {
//     e.preventDefault();

//     // create an auth client
//     let authClient = await AuthClient.create();
    
//     // start the login process and wait for it to finish
//     await new Promise((resolve) => {
//       authClient.login({
//               identityProvider:
//               process.env.DFX_NETWORK === "ic"
//               ? "https://identity.ic0.app"
//               : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`,
//               onSuccess: resolve,
//             });
//           });

//           // At this point we're authenticated, and we can get the identity from the auth client:
//       const identity = authClient.getIdentity();
//       // Using the identity obtained from the auth client, we can create an agent to interact with the IC.
//       const agent = new HttpAgent({ identity });
//       // Using the interface description of our webapp, we create an actor that we use to call the service methods.
//       actor = createActor(process.env.CANISTER_ID_II_INTEGRATION_BACKEND, {
//           agent,
//         });

//         return false;
//       };
      
//       const logout = document.getElementById("logout");
//   logout.onclick = async (e) => {
//     e.preventDefault();
//     let authClient = await AuthClient.create();
//     await authClient.logout();
//         actor = ii_integration_backend;
        
//         return false;
//       };
      
//       return { actor, UID, getPrincipal, login, logout };
//     };
    
//     export default useAuth;
    



    
    // const [UID, setUID] = useState('');
    // let actor = ugd_backend;
  
    // console.log(process.env.CANISTER_ID_INTERNET_IDENTITY)
  
    // const getPrincipal = document.getElementById("greet");
    // greetButton.onclick = async (e) => {
    //     e.preventDefault();
  
    //     greetButton.setAttribute("disabled", true);
  
    //     // Interact with backend actor, calling the greet method
    //     const UID = await actor.whoami();
    //         // (await Actor.agentOf(actor).getPrincipal()).toString()  // This gets the agent of an actor. It's useful if you need to replace or invalidate the identity used by an actors agent.
  
    //     getPrincipal.removeAttribute("disabled");
  
    //     document.getElementById("greeting").innerText = UID;
  
    //     return false;
    // };
    
    
    
    

    
    
    
    
    
    
    
    
    