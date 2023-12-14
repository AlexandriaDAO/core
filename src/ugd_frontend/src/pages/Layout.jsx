// // OG OG
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Tabs from "../header/Tabs";
import Create from "./Create";
import Earn from "./Earn";
import Share from "./Share";
import Post from "./Post";
import Author from "./Author";
import NotFound from "./NotFound";
import "../styles/main.css";

const Layout = () => {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div
        id="imageContainer"
        className="image-container"
        style={{
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: "0.5",
          zIndex: -1,
        }}
      ></div>
      <div style={{ paddingTop: "25px" }}>
        <Tabs />
        <Routes>
          <Route path="/" element={<Navigate to="/create" />} />
          <Route path="create" element={<Create />} />
          <Route path="earn" element={<Earn />} />
          <Route path="share" element={<Share />} />
          <Route path="post" element={<Post />} />
          <Route path="author" element={<Author />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default Layout;



















// import React, {useState} from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Tabs from "../header/Tabs";
// import Create from "./Create";
// import Earn from "./Earn";
// import Share from "./Share";
// import Post from "./Post";
// import Author from "./Author";
// import NotFound from "./NotFound";
// import "../styles/main.css";

// import {
//   createActor,
//   ugd_backend,
// } from '../../../declarations/ugd_backend';
// import { AuthClient } from "@dfinity/auth-client";
// import { HttpAgent } from "@dfinity/agent";

// const Layout = () => {
//   let actor = ugd_backend;
//   const [greeting, setGreeting] = useState("");

//   const handleLogin = async () => {
//     let authClient = await AuthClient.create();

//     await new Promise((resolve) => {
//       authClient.login({
//         identityProvider: "https://identity.ic0.app",
//           // process.env.DFX_NETWORK === "ic"
//             // ? "https://identity.ic0.app"
//             // : `http://127.0.0.1:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`,
//             // : "https://identity.ic0.app",
//         onSuccess: resolve,
//       });
//     });

//     const identity = authClient.getIdentity();
//     console.log("Identity", identity)
//     const agent = new HttpAgent({ identity });
//     actor = createActor(process.env.CANISTER_ID_UGD_BACKEND, {
//       agent,
//     });
//   };

//   const handleGreet = async () => {
//     try {
//       const newGreeting = await actor.greet("Your Greeting Message Here");
//       setGreeting(newGreeting);
//     } catch (error) {
//       console.error("Error fetching greeting:", error);
//     }
//   };

//   return (
//     <div style={{ position: "relative", minHeight: "100vh" }}>
//       <div
//         id="imageContainer"
//         className="image-container"
//         style={{
//           backgroundSize: "cover",
//           backgroundAttachment: "fixed",
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           opacity: "0.5",
//           zIndex: -1,
//         }}
//       ></div>
//       <div style={{ paddingTop: "25px" }}>
//         <Tabs />
//         <button onClick={handleLogin}>Login</button>
//         <button onClick={handleGreet}>Greet</button>
//         {greeting && <p>{greeting}</p>}
//         <Routes>
//           <Route path="/" element={<Navigate to="/create" />} />
//           <Route path="create" element={<Create />} />
//           <Route path="earn" element={<Earn />} />
//           <Route path="share" element={<Share />} />
//           <Route path="post" element={<Post />} />
//           <Route path="author" element={<Author />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// export default Layout;









// import React, { useState, useEffect } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Tabs from "../header/Tabs";
// import Create from "./Create";
// import Earn from "./Earn";
// import Share from "./Share";
// import Post from "./Post";
// import Author from "./Author";
// import NotFound from "./NotFound";
// import "../styles/main.css";

// import { createActor, ugd_backend } from '../../../declarations/ugd_backend';
// import { AuthClient } from "@dfinity/auth-client";
// import { HttpAgent, Actor } from "@dfinity/agent"; // Import Actor

// const Layout = () => {
//   const [actor, setActor] = useState(ugd_backend);
//   const [greeting, setGreeting] = useState("");
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [identity, setIdentity] = useState(null); // State to store the user's identity

//   useEffect(() => {
//     AuthClient.create().then(authClient => {
//       setIsLoggedIn(!!authClient.getIdentity());
//       setIdentity(authClient.getIdentity()); // Store identity in state
//     });
//   }, []);

//   const handleLogin = async () => {
//     let authClient = await AuthClient.create();

//     await new Promise((resolve) => {
//       authClient.login({
//         identityProvider: "https://identity.ic0.app",
//         onSuccess: () => {
//           setIsLoggedIn(true);
//           setIdentity(authClient.getIdentity());
//           resolve();
//         },
//       });
//     });

//     const agent = new HttpAgent({ identity: authClient.getIdentity() });
//     setActor(createActor(process.env.CANISTER_ID_UGD_BACKEND, { agent }));
//   };

//   const handleGreet = async () => {
//     if (!actor || !identity) return;

//     try {
//       // Fetch the principal ID and send it to the greet function
//       const principalId = identity.getPrincipal().toString();
//       const newGreeting = await actor.greet(principalId);
//       setGreeting(newGreeting);
//     } catch (error) {
//       console.error("Error fetching greeting:", error);
//     }
//   };

//   const handleLogout = async () => {
//     let authClient = await AuthClient.create();

//     // Perform the logout operation
//     authClient.logout();

//     // Reset the state
//     setIsLoggedIn(false);
//     setIdentity(null);
//     setActor(ugd_backend); // Reset to the default actor
//     // Additional state resets can be done here if needed
//   };

//   return (
//     <div style={{ position: "relative", minHeight: "100vh" }}>
//       <div
//         id="imageContainer"
//         className="image-container"
//         style={{
//           backgroundSize: "cover",
//           backgroundAttachment: "fixed",
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           opacity: "0.5",
//           zIndex: -1,
//         }}
//       ></div>
//       <div style={{ paddingTop: "25px" }}>
//         <Tabs />
//         <button onClick={handleGreet}>Greet</button>
//         {isLoggedIn ? (
//           <button onClick={handleLogout}>Logout</button>
//         ) : (
//           <button onClick={handleLogin}>Login</button>
//         )}
//         {greeting && <p>{greeting}</p>}
//         <Routes>
//           <Route path="/" element={<Navigate to="/create" />} />
//           <Route path="create" element={<Create />} />
//           <Route path="earn" element={<Earn />} />
//           <Route path="share" element={<Share />} />
//           <Route path="post" element={<Post />} />
//           <Route path="author" element={<Author />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// export default Layout;





// // // Here are some examples from the @dfinity/auth-client docs:
// // To get started with auth client, run

// const authClient = await AuthClient.create();

// // The authClient can log in with

// authClient.login({
//   // 7 days in nanoseconds
//   maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
//   onSuccess: async () => {
//     handleAuthenticated(authClient);
//   },
// });

// // It opens an identity.ic0.app window, saves your delegation to localStorage, and then sets you up with an identity.

// // Then, you can use that identity to make authenticated calls using the @dfinity/agent Actor.

// const identity = await authClient.getIdentity();
// const actor = Actor.createActor(idlFactory, {
//   agent: new HttpAgent({
//     identity,
//   }),
//   canisterId,
// });



// // Here's my main component file where I seek to integrate a login, logout, and greet button (greet being passed the principalId and returned from the backend.)
// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Tabs from "../header/Tabs";
// import Create from "./Create";
// import Earn from "./Earn";
// import Share from "./Share";
// import Post from "./Post";
// import Author from "./Author";
// import NotFound from "./NotFound";
// import "../styles/main.css";

// // NEW for AUTH
// import { createActor, ugd_backend } from '../../../declarations/ugd_backend';
// import { AuthClient } from "@dfinity/auth-client";
// import { HttpAgent, Actor } from "@dfinity/agent"; 



// const Layout = () => {
//   return (
//     <div style={{ position: "relative", minHeight: "100vh" }}>
//       <div
//         id="imageContainer"
//         className="image-container"
//         style={{
//           backgroundSize: "cover",
//           backgroundAttachment: "fixed",
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           opacity: "0.5",
//           zIndex: -1,
//         }}
//       ></div>
//       <div style={{ paddingTop: "25px" }}>
//         <button onClick={handleGreet}>Greet</button>
//         {isLoggedIn ? (
//           <button onClick={handleLogout}>Logout</button>
//         ) : (
//           <button onClick={handleLogin}>Login</button>
//         )}
//         {greeting && <p>{greeting}</p>}
//         <Tabs />
//         <Routes>
//           <Route path="/" element={<Navigate to="/create" />} />
//           <Route path="create" element={<Create />} />
//           <Route path="earn" element={<Earn />} />
//           <Route path="share" element={<Share />} />
//           <Route path="post" element={<Post />} />
//           <Route path="author" element={<Author />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// export default Layout;










// import React, { useState, useEffect } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Tabs from "../header/Tabs";
// import Create from "./Create";
// import Earn from "./Earn";
// import Share from "./Share";
// import Post from "./Post";
// import Author from "./Author";
// import NotFound from "./NotFound";
// import "../styles/main.css";

// // Importing necessary modules
// import { createActor, ugd_backend } from '../../../declarations/ugd_backend';
// import { AuthClient } from "@dfinity/auth-client";
// import { HttpAgent, Actor } from "@dfinity/agent"; 

// const Layout = () => {
//   const [authClient, setAuthClient] = useState(null);
//   const [actor, setActor] = useState(ugd_backend);
//   const [identity, setIdentity] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [greeting, setGreeting] = useState('');

//   // Initialize the AuthClient
//   useEffect(() => {
//     AuthClient.create().then(client => {
//       setAuthClient(client);
//       const currentIdentity = client.getIdentity();
//       setIdentity(currentIdentity);
//       setIsLoggedIn(!!currentIdentity);
//     });
//   }, []);


//   // Login handler
//   const handleLogin = async () => {
//     if (!authClient) return;

//     authClient.login({
//       identityProvider: "https://identity.ic0.app", // Specifying identity provider
//       maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
//       onSuccess: async () => {
//         const loggedInIdentity = authClient.getIdentity();
//         setIdentity(loggedInIdentity);
//         setIsLoggedIn(true);
//         const agent = new HttpAgent({ identity: loggedInIdentity });

//         // Update the actor with the authenticated agent
//         setActor(createActor(process.env.CANISTER_ID_UGD_BACKEND, { agent }));
//       },
//     });
//   };

//   // Logout handler
//   const handleLogout = async () => {
//     if (!authClient) return;

//     await authClient.logout();
//     setIsLoggedIn(false);
//     setIdentity(null);
//     setActor(ugd_backend); // Reset to the default actor
//     setGreeting('');
//   };

//   // Greet handler
//   const handleGreet = async () => {
//     if (!actor || !identity) return;

//     try {
//       const principalId = identity.getPrincipal().toString();
//       const newGreeting = await actor.greet(principalId);
//       setGreeting(newGreeting);
//     } catch (error) {
//       console.error("Error fetching greeting:", error);
//       setGreeting('Error fetching greeting');
//     }
//   };

//   return (
//     <div style={{ position: "relative", minHeight: "100vh" }}>
//       <div
//         id="imageContainer"
//         className="image-container"
//         style={{
//           backgroundSize: "cover",
//           backgroundAttachment: "fixed",
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           opacity: "0.5",
//           zIndex: -1,
//         }}
//       ></div>
//       <div style={{ paddingTop: "25px" }}>
//         <Tabs />
//         <button onClick={handleGreet}>Greet</button>
//         {isLoggedIn ? (
//           <button onClick={handleLogout}>Logout</button>
//         ) : (
//           <button onClick={handleLogin}>Login</button>
//         )}
//         {greeting && <p>{greeting}</p>}
//         <Routes>
//           <Route path="/" element={<Navigate to="/create" />} />
//           <Route path="create" element={<Create />} />
//           <Route path="earn" element={<Earn />} />
//           <Route path="share" element={<Share />} />
//           <Route path="post" element={<Post />} />
//           <Route path="author" element={<Author />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// export default Layout;








// // Trying to get backend to work is in moritz version
// // Apparently greeting is not defined.

// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Tabs from "../header/Tabs";
// import Create from "./Create";
// import Earn from "./Earn";
// import Share from "./Share";
// import Post from "./Post";
// import Author from "./Author";
// import NotFound from "./NotFound";
// import "../styles/main.css";

// // Importing necessary modules
// import { createActor, ugd_backend } from '../../../declarations/ugd_backend';
// import { AuthClient } from "@dfinity/auth-client";
// import { HttpAgent, Actor } from "@dfinity/agent"; 


// const Layout = () => {
//   let actor = ugd_backend;

//   // Greet function
//   const handleGreet = async () => {
//     const greetButton = document.getElementById("greet");
//     greetButton.setAttribute("disabled", true);

//     // Interact with backend actor, calling the greet method
//     const greeting = await actor.greet(
//       (await Actor.agentOf(actor).getPrincipal()).toString()
//     );

//     greetButton.removeAttribute("disabled");
//     document.getElementById("greeting").innerText = greeting;
//   };

//   // const handleGreet = async () => {
//   //   const greetButton = document.getElementById("greet");
//   //   greetButton.setAttribute("disabled", true);

//   //   // Interact with backend actor, calling the greet method
//   //   const greeting = await actor.greet(
//   //     (await Actor.agentOf(actor).getPrincipal()).toString()
//   //   );

//   //   greetButton.removeAttribute("disabled");

//   //   // Set the greeting text
//   //   document.getElementById("greetingMessage").innerText = greeting;
//   // };

//   // Login function
//   const handleLogin = async () => {
//     const loginButton = document.getElementById("login");
//     loginButton.setAttribute("disabled", true);

//     // Create an auth client and start the login process
//     let authClient = await AuthClient.create();
//     await new Promise((resolve) => {
//       authClient.login({
//         identityProvider: process.env.DFX_NETWORK === "https://identity.ic0.app",
//         onSuccess: resolve,
//       });
//     });

//     // Get the identity and create an actor
//     const identity = authClient.getIdentity();
//     console.log("Identity Const: ", identity)
//     const agent = new HttpAgent({ identity });
//     actor = createActor(process.env.CANISTER_ID_II_INTEGRATION_BACKEND, { agent });

//     loginButton.removeAttribute("disabled");
//   };

//   return (
//     <div style={{ position: "relative", minHeight: "100vh" }}>
//       <div
//         id="imageContainer"
//         className="image-container"
//         style={{
//           backgroundSize: "cover",
//           backgroundAttachment: "fixed",
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           opacity: "0.5",
//           zIndex: -1,
//         }}
//       ></div>
//       <div style={{ paddingTop: "25px" }}>
//         <Tabs />
//         {/* <button onClick={handleGreet}>Greet</button>
//         {isLoggedIn ? (
//           <button onClick={handleLogout}>Logout</button>
//         ) : (
//           <button onClick={handleLogin}>Login</button>
//         )} */}
//         {/* {greeting && <p>{greeting}</p>} */}
//         <button id="greet" onClick={handleGreet}>Greet</button>
//         <button id="login" onClick={handleLogin}>Login</button>
//         <p id="greetingMessage"></p>
        
//         <Routes>
//           <Route path="/" element={<Navigate to="/create" />} />
//           <Route path="create" element={<Create />} />
//           <Route path="earn" element={<Earn />} />
//           <Route path="share" element={<Share />} />
//           <Route path="post" element={<Post />} />
//           <Route path="author" element={<Author />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// export default Layout;













