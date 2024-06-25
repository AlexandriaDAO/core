// features/gasless-uploader/KeyManager.tsx
import React, { FC, useState, useEffect } from "react";
import { saveKeys, deleteKeys, getKeys, decryptKey } from "../../../services/walletService";
import { useAuth } from "src/ucg_frontend/src/contexts/AuthContext";

const KeyManager: FC = () => {
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [slotIndex, setSlotIndex] = useState(0);
  const [savedKeys, setSavedKeys] = useState<any[]>([]);
  const { UID } = useAuth();

  useEffect(() => {
    const fetchSavedKeys = async () => {
      if (UID) {
        try {
          const keys = await getKeys();
          setSavedKeys(keys);
        } catch (error) {
          console.error("Error retrieving saved keys:", error);
        }
      }
    };

    fetchSavedKeys();
  }, [UID]);

  const handleSaveKeys = async () => {
    console.log("UID: ", UID);
    if (UID) {
      try {
        await saveKeys(publicKey, privateKey, slotIndex, UID);
        // Clear the input fields after saving
        setPublicKey("");
        setPrivateKey("");
        setSlotIndex(0);
        // Refresh the saved keys
        const keys = await getKeys();
        setSavedKeys(keys);
      } catch (error) {
        console.error("Error saving keys:", error);
      }
    } else {
      console.error("User not authenticated");
    }
  };

  const handleDeleteKeys = async (slotIndex: number) => {
    try {
      await deleteKeys(slotIndex);
      // Refresh the saved keys after deletion
      const keys = await getKeys();
      setSavedKeys(keys);
    } catch (error) {
      console.error("Error deleting keys:", error);
    }
  };

  const handleRevealKeys = (publicKey: string, privateKey: string) => {
    if (UID) {
      try {
        const decryptedPublicKey = decryptKey(publicKey, UID.toText());
        const decryptedPrivateKey = decryptKey(privateKey, UID.toText());
        alert(`Public Key: ${decryptedPublicKey}\nPrivate Key: ${decryptedPrivateKey}`);
      } catch (error) {
        console.error("Error decrypting keys:", error);
        alert("Error decrypting keys. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col text-xs space-y-1 items-start">
      <h1 className="text-2xl font-bold rounded-xl mb-3">Save your own wallet:</h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-base text-neutral-700">Enter your ETH Wallet Public Key:</p>
          <input
            type="text"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            className="rounded bg-[#D8CFCA] px-2 py-1"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-base text-neutral-700">Enter your ETH Wallet Private Key:</p>
          <input
            type="text"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="rounded bg-[#D8CFCA] px-2 py-1"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-base text-neutral-700">Enter Slot Index:</p>
          <input
            type="number"
            value={slotIndex}
            onChange={(e) => setSlotIndex(parseInt(e.target.value))}
            className="rounded bg-[#D8CFCA] px-2 py-1"
          />
        </div>
        <button
          onClick={handleSaveKeys}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Wallet
        </button>
        <div className="gap-2">
          It's recommended to use an empty and dedicated wallet for this, as your private key can be decrypted by a node provider that discovers your principal. To learn more about how your keys are secured, visit abc.xyz.
        </div>
      </div>
      {savedKeys.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold rounded-xl mb-3">Your Wallets:</h2>
          <ul>
            {savedKeys.map((key, index) => (
              <li key={index}>
                Slot Index: {key.slot}
                <button
                  onClick={() => handleRevealKeys(key.public_key, key.private_key)}
                  className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
                >
                  Reveal Keys
                </button>
                <button
                  onClick={() => handleDeleteKeys(key.slot)}
                  className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default KeyManager;