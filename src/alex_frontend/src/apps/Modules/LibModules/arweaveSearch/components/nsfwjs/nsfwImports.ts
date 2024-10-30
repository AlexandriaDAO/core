import type { NSFWJS } from 'nsfwjs';
import type { TensorFlow } from './types';

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
export const importTensorFlow = async () => {
  const tf = await import(
    /* webpackChunkName: "tensorflow" */
    /* webpackPreload: true */
    '@tensorflow/tfjs'
  );
  return tf.default || tf;
};

export const importNSFWJS = async () => {
  const nsfwjs = await import(
    /* webpackChunkName: "nsfwjs" */
    /* webpackPreload: true */
    'nsfwjs'
  );
  return nsfwjs.default || nsfwjs;
};
