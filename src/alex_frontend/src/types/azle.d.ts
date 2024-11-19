declare module 'azle' {
  export interface AzleFetchHeaders {
    entries(): IterableIterator<[string, string]>;
  }

  export type Principal = any;
  
  export const caller: any;
  export const IDL: any;
  export const init: any;
  export const postUpgrade: any;
  export const Principal: any;
  export const query: (...args: any[]) => any;
  export const toHexString: (input: any) => string;
  export const update: (...args: any[]) => any;
  export const call: (...args: any[]) => any;
} 