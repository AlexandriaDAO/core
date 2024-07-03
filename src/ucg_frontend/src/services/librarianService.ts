import { Principal } from "@dfinity/principal";

export interface Librarian {
  hashed_principal: bigint;
  raw_principal: Principal;
  name: string;
}

export const saveLibrarian = async (ucgActor: any, name: string): Promise<void> => {
  try {
    await ucgActor.save_librarian(name);
    console.log('Librarian saved successfully');
  } catch (error) {
    console.error('Error saving librarian:', error);
    throw error;
  }
};

export const deleteLibrarian = async (ucgActor: any): Promise<void> => {
  try {
    await ucgActor.delete_librarian();
    console.log('Librarian deleted successfully');
  } catch (error) {
    console.error('Error deleting librarian:', error);
    throw error;
  }
};

export const getLibrariansPublic = async (ucgActor: any): Promise<[bigint, string][] | undefined> => {
  try {
    const result = await ucgActor.get_hashes_and_names();
    if (Array.isArray(result) && result.length > 0) {
      return result as [bigint, string][];
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('Error retrieving librarian hashes and names:', error);
    throw error;
  }
};

export const getLibrarianByHash = async (ucgActor: any, hashedPrincipal: bigint): Promise<Librarian | undefined> => {
  try {
    const result = await ucgActor.get_librarian(hashedPrincipal);
    console.log("result of getLibrarinByHas()", result);
    if (result && result.length > 0) {
      const librarianData = result[0];
      if ('hashed_principal' in librarianData && 'raw_principal' in librarianData && 'name' in librarianData) {
        const librarian: Librarian = {
          hashed_principal: librarianData.hashed_principal,
          raw_principal: librarianData.raw_principal,
          name: librarianData.name,
        };
        return librarian;
      }
    }
    return undefined;
  } catch (error) {
    console.error('Error retrieving librarian:', error);
    throw error;
  }
};

export const isLibrarian = async (ucgActor: any): Promise<boolean> => {
  try {
    const librarian: boolean = await ucgActor.is_librarian();
    console.log("IsLibrarian?: ", librarian)
    return librarian;
  } catch (error) {
    console.error('Error checking librarian status:', error);
    throw error;
  }
};