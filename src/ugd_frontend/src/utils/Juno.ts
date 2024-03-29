import { Environment, Unsubscribe } from "@junobuild/core";

import {EnvStore} from "@junobuild/core/dist/types/stores/env.store";

export const initJuno = async (env: Environment): Promise<Unsubscribe[]> => {
    EnvStore.getInstance().set(env);
    return [];
};