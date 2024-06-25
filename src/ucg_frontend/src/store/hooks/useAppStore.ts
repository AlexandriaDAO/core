import { useStore } from "react-redux";
import { store } from "..";

// Here you can also explicitly define the type of your store if necessary
export type AppStore = typeof store;

export const useAppStore: () => AppStore = useStore;