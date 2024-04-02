import { useDispatch } from "react-redux";
import { AppDispatch } from "../storeTypes";

export const useAppDispatch: () => AppDispatch = useDispatch;