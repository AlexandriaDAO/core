// // No longer used. Replaced by engine.rs for now.

// // src/components/KeyManager.jsx
// import React, { useState, useEffect } from 'react';
// import MeiliSearchClient from '../../utils/MeiliSearchClient';
// import { useAuth } from "../../contexts/AuthContext";

// const KeyManager = ({ onClientInitialized }) => {
//   const { UID } = useAuth();
//   const { saveMeiliSearchKeys, getMeiliSearchKeys } = MeiliSearchClient();
//   const [meiliDomain, setMeiliDomain] = useState('');
//   const [meiliKey, setMeiliKey] = useState('');
//   const [slotIndex, setSlotIndex] = useState(0);
//   const [keys, setKeys] = useState([]);
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchKeys = async () => {
//       try {
//         const fetchedKeys = await getMeiliSearchKeys();

//         console.log("saved keys", fetchedKeys);
//         setKeys(fetchedKeys);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching keys:', error);
//       }
//     };

//     if (UID) {
//       fetchKeys();
//     }
//   }, [UID]);

//   useEffect(() => {
//     if (selectedSlot !== null && !loading) {
//       initializeClient(selectedSlot);
//     }
//   }, [selectedSlot, loading]);

//   const handleSaveKeys = async () => {
//     try {
//       const success = await saveMeiliSearchKeys(meiliDomain, meiliKey, slotIndex);
//       if(success){
//         setKeys(prevKeys => [...prevKeys, { meili_domain: meiliDomain, meili_key: meiliKey, slot: slotIndex }]);
//         setMeiliDomain('');
//         setMeiliKey('');
//         setSlotIndex(0);
//       }else{
//         alert('Unable to store keys, Try again!!!')
//       }
//     } catch (error) {
//       console.error('Error saving keys:', error);
//     }
//   };

//   const handleSlotChange = (slot) => {
//     setSelectedSlot(slot);
//   };

//   const initializeClient = (slot) => {
//     const selectedKey = keys.find(key => key.slot === slot);

//     if (selectedKey) {
//       onClientInitialized(selectedKey.meili_domain, selectedKey.meili_key);
//     }
//   };

//   return (
//     <div className='flex flex-col gap-2'>
//       <div className='grid grid-cols-[auto_1fr] gap-2 w-96 justify-items-start'>
//         <span className='col-span-full font-semibold text-lg'>Store New Key</span>
//         <label>MeiliSearch Domain:</label>
//         <input type="text" className='w-full' value={meiliDomain} onChange={(e) => setMeiliDomain(e.target.value)} />
//         <label>MeiliSearch Key:</label>
//         <input type="text" className='w-full' value={meiliKey} onChange={(e) => setMeiliKey(e.target.value)} />
//         <label>Slot Index:</label>
//         <input type="number" className='w-full' value={slotIndex} onChange={(e) => setSlotIndex(Number(e.target.value))} />
//         <button onClick={handleSaveKeys} className='bg-green-400 text-black hover:bg-green-300 px-2 transition-all duration-300 rounded col-span-full self-center'>
//           Submit
//         </button>
//       </div>

//       <div className='flex flex-col gap-1'>
//         <span className='font-semibold text-lg mb-1'>Previously Stored Keys</span>
//         {keys.length>0 ? keys.map((key,index)=> <div key={index} className='p-2 border border-solid border-gray-500 shadow rounded flex items-center'>
//             <div className='flex flex-col'>
//               <div className='flex gap-1'>
//                 <span className='font-bold'>Domain</span>
//                 <span>{key.meili_domain}</span>
//               </div>
//               <div className='flex gap-1'>
//                 <span className='font-bold'>Key</span>
//                 <span>{key.meili_key}</span>
//               </div>
//               <div className='flex gap-1'>
//                 <span className='font-bold'>Slot</span>
//                 <span>{key.slot}</span>
//               </div>
//             </div>
//             <div className='flex justify-center items-center flex-grow'>
//               <button className='bg-green-400 text-black hover:bg-green-300 px-2 transition-all duration-300 rounded' onClick={() => handleSlotChange(key.slot)}>Select</button>
//             </div>
//           </div>) : <div>No Client Initialized, Check Your keys.</div> }
//         {selectedSlot !== null && (
//           <p>Selected Slot: {selectedSlot}</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default KeyManager;