import { useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { RootState } from "..";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;