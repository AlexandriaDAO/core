import { isEqual } from 'lodash';

/**
 * Minimal utility for comparing arrays of objects by specific properties
 */
export function compareArrays<T extends Record<string, any>>(
  array1: T[], 
  array2: T[], 
  keys: string[] = ['id']
): boolean {
  if (array1.length !== array2.length) return false;
  
  const extract = (item: T) => keys.reduce((obj, key) => ({ ...obj, [key]: item[key] }), {});
  return isEqual(array1.map(extract), array2.map(extract));
}

/**
 * Standard format for hook return values to maintain consistency
 */
export function createReorderReturn(
  reorderableProps: any, 
  editedItems: any[],
  saveMethodName: string = 'saveOrder'
) {
  const { saveOrder, ...rest } = reorderableProps;
  
  return {
    ...rest,
    editedItems,
    [saveMethodName]: saveOrder
  };
} 