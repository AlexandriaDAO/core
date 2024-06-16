import { Keys } from "src/declarations/ugd_backend/ugd_backend.did";
import { ugd_backend } from '../../../declarations/ugd_backend';
import sjcl from 'sjcl';
import { Principal } from "@dfinity/principal";

export const encryptKey = (rawKey: string, UID: string): string => {
  const encryptedKey = sjcl.encrypt(UID, rawKey);
  return JSON.stringify(encryptedKey);
};

export const decryptKey = (encryptedKey: string, UID: string): string => {
  try {
    const encryptedObject = JSON.parse(encryptedKey);
    const decryptedKey = sjcl.decrypt(UID, encryptedObject);
    return decryptedKey;
  } catch (error) {
    console.error('Error decrypting key:', error);
    throw error;
  }
};

export const saveKeys = async (publicKey: string, privateKey: string, slotIndex: number, UID: Principal): Promise<void> => {
  try {
    const encryptedPublicKey = encryptKey(publicKey, UID.toText());
    const encryptedPrivateKey = encryptKey(privateKey, UID.toText());

    await ugd_backend.save_keys(encryptedPublicKey, encryptedPrivateKey, slotIndex);
    console.log('Keys saved successfully');
  } catch (error) {
    console.error('Error saving keys:', error);
    throw error;
  }
};

export const getKeys = async(): Promise<Keys[]> => {
  try {
    return await ugd_backend.get_keys();
    } catch (error) {
        console.error('Error retrieving MeiliSearch keys:', error);
      }
    return [];
  };

export const deleteKeys = async (slot: number): Promise<void> => {
  try {
    await ugd_backend.delete_keys(slot);
    console.log(`Keys for slot index ${slot} deleted successfully`);
  } catch (error) {
    console.error('Error deleting keys:', error);
    throw error;
  }
};