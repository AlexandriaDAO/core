export type { NSFWJS } from 'nsfwjs';
export type TensorFlow = typeof import('@tensorflow/tfjs');

let tf: TensorFlow | null = null;
let nsfwjs: typeof import('nsfwjs') | null = null;

export const setTf = (tfInstance: TensorFlow | null) => {
  tf = tfInstance;
};

export const getTf = () => tf;

export const setNsfwjs = (nsfwjsInstance: typeof import('nsfwjs') | null) => {
  nsfwjs = nsfwjsInstance;
};

export const getNsfwjs = () => nsfwjs;

// Dynamic import functions
export const importTensorFlow = () => import(
  /* webpackChunkName: "tensorflow" */
  /* webpackPrefetch: true */
  '@tensorflow/tfjs'
);
export const importNSFWJS = () => import(
  /* webpackChunkName: "nsfwjs" */
  /* webpackPrefetch: true */
  'nsfwjs'
);
