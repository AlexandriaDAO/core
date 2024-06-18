import React, { FC, useEffect, useState } from "react";
import { saveKeys, isLibrarian, getKeysHashes, getKeysByHash } from "../../../services/librarianService";
import { useAuth } from '../../../contexts/AuthContext';

const SaveLibrarian: FC = () => {
  const { librariansActor } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);
  const [availableHashes, setAvailableHashes] = useState<bigint[]>([]);
  const [keysByHash, setKeysByHash] = useState<{ [hash: string]: string }>({});
  const [isUserLibrarian, setIsUserLibrarian] = useState(false);


  useEffect(() => {
    const fetchAvailableHashes = async () => {
      try {
        const hashes = await getKeysHashes(librariansActor);
        if (hashes) {
          setAvailableHashes([hashes]);
        }
      } catch (error) {
        console.error("Error retrieving available hashes:", error);
      }
    };

    const checkUserLibrarianStatus = async () => {
      try {
        const isLibrarianUser = await isLibrarian(librariansActor);
        console.log("is librarian?: ", isLibrarianUser);
        setIsUserLibrarian(isLibrarianUser);
      } catch (error) {
        console.error("Error checking librarian status:", error);
      }
    };

    fetchAvailableHashes();
    checkUserLibrarianStatus();
  }, [librariansActor]);

  useEffect(() => {
    const fetchKeysByHash = async () => {
      try {
        const keys: { [hash: string]: string } = {};
        for (const hash of availableHashes) {
          const keyResult = await getKeysByHash(librariansActor, hash);
          if (keyResult && "ok" in keyResult && typeof keyResult.ok === "string") {
            keys[hash.toString()] = keyResult.ok;
          }
        }
        setKeysByHash(keys);
      } catch (error) {
        console.error("Error retrieving keys by hash:", error);
      }
    };

    if (availableHashes.length > 0) {
      fetchKeysByHash();
    }
  }, [availableHashes, librariansActor]);

  const handleSaveKeys = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      await saveKeys(librariansActor);
      setSaveStatus("success");
      setIsUserLibrarian(true);
    } catch (error) {
      console.error("Error saving keys:", error);
      setSaveStatus("error");
    }

    setIsSaving(false);
  };
  
  return (
    <div className="mx-auto py-10 bg-background text-text flex flex-col-reverse gap-10 md:flex-row justify-center items-start">
      {isUserLibrarian ? (
        <p>You are already a librarian.</p>
      ) : (
        <button
          onClick={handleSaveKeys}
          disabled={isSaving}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {isSaving ? "Saving..." : "Become a Librarian"}
        </button>
      )}
      {saveStatus === "success" && <p className="text-green-500">Keys saved successfully!</p>}
      {saveStatus === "error" && <p className="text-red-500">Error saving keys. Please try again.</p>}
      {availableHashes.length > 0 && (
        <div>
          <p>Available hashes and keys:</p>
          <ul>
            {availableHashes.map((hash, index) => (
              <li key={index}>
                Hash: {hash.toString()}
                <br />
                Key: {keysByHash[hash.toString()] || "N/A"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SaveLibrarian;