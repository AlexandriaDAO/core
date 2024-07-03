import React, { FC, useEffect, useState } from "react";
import { saveLibrarian, isLibrarian, getLibrariansPublic, deleteLibrarian} from "../../../services/librarianService";
import { useAuth } from '../../../contexts/AuthContext';
import { useActiveLibrarian } from '../../../contexts/LibrarianContext'; 
import { useKeys } from "../../../contexts/KeysContext";
import { getLibrarianByHash } from "../../../services/librarianService";
import { getLibrarianKeys } from "@/services/walletService";

const SaveLibrarian: FC = () => {
  const { ucgActor } = useAuth();
  const { activeLibrarian, setActiveLibrarian } = useActiveLibrarian();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<"success" | "error" | null>(null);
  const [librarians, setLibrarians] = useState<[bigint, string][]>([]);
  const [isUserLibrarian, setIsUserLibrarian] = useState(false);
  const [librarianName, setLibrarianName] = useState("");

  useEffect(() => {
    fetchLibrarians();
    checkUserLibrarianStatus();
  }, [ucgActor]);

  const handleLibrarianClick = async (hash: bigint, name: string) => {
    setActiveLibrarian({ hash, name });

    try {
      const librarian = await getLibrarianByHash(ucgActor, hash);
      console.log("Librarin var: ", librarian)
      if (librarian) {
        const keys = await getLibrarianKeys(librarian.raw_principal);
        console.log("Available keys for the librarian:", keys);

      }
    } catch (error) {
      console.error('Error retrieving librarian keys:', error);
    }
  };

  const fetchLibrarians = async () => {
    try {
      const allLibrarians = await getLibrariansPublic(ucgActor);
      setLibrarians(allLibrarians || []);
    } catch (error) {
      console.error("Error retrieving librarians:", error);
    }
  };

  const checkUserLibrarianStatus = async () => {
    try {
      const isLibrarianUser = await isLibrarian(ucgActor);
      setIsUserLibrarian(isLibrarianUser);
    } catch (error) {
      console.error("Error checking librarian status:", error);
    }
  };

  const handleSaveLibrarian = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      await saveLibrarian(ucgActor, librarianName);
      setSaveStatus("success");
      setIsUserLibrarian(true);
      fetchLibrarians();
    } catch (error) {
      console.error("Error saving librarian:", error);
      setSaveStatus("error");
    }

    setIsSaving(false);
  };

  const handleDeleteLibrarian = async () => {
    try {
      await deleteLibrarian(ucgActor);
      setDeleteStatus("success");
      setIsUserLibrarian(false);
      fetchLibrarians();
    } catch (error) {
      console.error("Error deleting librarian:", error);
      setDeleteStatus("error");
    }
  };


  return (
    <div className="mx-auto py-10 bg-background text-text flex flex-col gap-10 justify-center items-start">
      <div>
        {librarians.length > 0 ? (
          <>
            <h2 className="text-xl font-bold mb-4">Availible Librarians:</h2>
            <ul>
              {librarians.map(([hash, name], index) => {
                const isActive = activeLibrarian?.hash === hash;
                return (
                  <li
                    key={index}
                    className={`cursor-pointer py-2 px-4 rounded ${
                      isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                    }`}
                    onClick={() => handleLibrarianClick(hash, name)}
                  >
                    <strong>Name:</strong> {name}, <strong>Hash:</strong>{" "}
                    {hash.toString()}
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p>No librarians found.</p>
        )}
      </div>
      {isUserLibrarian ? (
        <div>
          <p>You are already a librarian.</p>
          <button
            onClick={handleDeleteLibrarian}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Delete Librarian
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={librarianName}
            onChange={(e) => setLibrarianName(e.target.value)}
            placeholder="Enter your librarian name"
            className="border border-gray-300 rounded px-2 py-1 mr-2"
          />
          <button
            onClick={handleSaveLibrarian}
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {isSaving ? "Saving..." : "Become a Librarian"}
          </button>
        </div>
      )}
      {saveStatus === "success" && (
        <p className="text-green-500">Librarian saved successfully!</p>
      )}
      {saveStatus === "error" && (
        <p className="text-red-500">Error saving librarian. Please try again.</p>
      )}
      {deleteStatus === "success" && (
        <p className="text-green-500">Librarian deleted successfully!</p>
      )}
      {deleteStatus === "error" && (
        <p className="text-red-500">
          Error deleting librarian. Please try again.
        </p>
      )}
    </div>
  );
};

export default SaveLibrarian;