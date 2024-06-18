import { Principal } from "@dfinity/principal";

export const saveKeys = async (librariansActor: any): Promise<void> => {
  try {
    await librariansActor.save_keys();
    console.log('Keys saved successfully');
  } catch (error) {
    console.error('Error saving keys:', error);
    throw error;
  }
};

export const deleteKeys = async (librariansActor: any): Promise<void> => {
  try {
    await librariansActor.delete_keys();
    console.log('Keys deleted successfully');
  } catch (error) {
    console.error('Error deleting keys:', error);
    throw error;
  }
};

export const getKeysHashes = async (librariansActor: any): Promise<bigint | undefined> => {
  try {
    const result = await librariansActor.get_hashes();
    if (result instanceof BigUint64Array && result.length > 0) {
      return result[0];
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('Error retrieving keys:', error);
    throw error;
  }
};

export const getKeysByHash = async (librariansActor: any, hashedPrincipal: bigint): Promise<Principal | undefined> => {
  try {
    const result = await librariansActor.get_librarian(hashedPrincipal);
    if (Array.isArray(result) && result.length > 0) {
      return result[0];
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('Error retrieving keys:', error);
    throw error;
  }
};

export const isLibrarian = async (librariansActor: any): Promise<boolean> => {
  try {
    console.log("Trying isLibrarian()");
    const librarian: boolean = await librariansActor.is_librarian();
    return librarian;
  } catch (error) {
    console.error('Error checking librarian status:', error);
    throw error;
  }
};















// // The purpose of this set of functions is so Librarians can save their principals in a different subnet so it's hard for anyone to decrypt their wallet & api keys.

// import { librarians } from '../../../declarations/librarians';
// import { Principal } from "@dfinity/principal";

// export const saveKeys = async (): Promise<void> => {
//   try {
//     await librarians.save_keys();
//     console.log('Keys saved successfully');
//   } catch (error) {
//     console.error('Error saving keys:', error);
//     throw error;
//   }
// };

// // Helper function to delete the keys of the caller
// export const deleteKeys = async (): Promise<void> => {
//   try {
//     await librarians.delete_keys();
//     console.log('Keys deleted successfully');
//   } catch (error) {
//     console.error('Error deleting keys:', error);
//     throw error;
//   }
// };


// export const getKeysHashes = async (): Promise<bigint | undefined> => {
//   try {
//     const result = await librarians.get_hashes();
//     if (result instanceof BigUint64Array && result.length > 0) {
//       return result[0];
//     } else {
//       return undefined;
//     }
//   } catch (error) {
//     console.error('Error retrieving keys:', error);
//     throw error;
//   }
// };

// // Helper function that takes a hash and returns the principal
// export const getKeysByHash = async (hashedPrincipal: bigint): Promise<Principal | undefined> => {
//   try {
//     const result = await librarians.get_librarian(hashedPrincipal);
//     if (Array.isArray(result) && result.length > 0) {
//       return result[0];
//     } else {
//       return undefined;
//     }
//   } catch (error) {
//     console.error('Error retrieving keys:', error);
//     throw error;
//   }
// };

// // Helper function to check if the caller is a librarian
// export const isLibrarian = async (): Promise<boolean> => {
//   try {
//     console.log("Trying islibrarian()")
//     const librarian: boolean = await librarians.is_librarian();
//     return librarian;
//   } catch (error) {
//     console.error('Error checking librarian status:', error);
//     throw error;
//   }
// };

