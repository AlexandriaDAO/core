import { AppStore } from "../storeTypes";
import { useStore } from "react-redux";

export const useAppStore: () => AppStore = useStore;