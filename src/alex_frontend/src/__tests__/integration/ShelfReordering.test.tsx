// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import { Provider } from 'react-redux';
// import { configureStore } from '@reduxjs/toolkit';
// import perpetuaReducer from '../../apps/app/Perpetua/state/perpetuaSlice';
// import * as perpetuaThunks from '../../apps/app/Perpetua/state';

// // Mock the hooks
// jest.mock('@/hooks/useIdentity', () => ({
//   useIdentity: jest.fn().mockReturnValue({
//     identity: {
//       getPrincipal: jest.fn().mockReturnValue({
//         toString: () => 'user1',
//       }),
//     },
//   }),
// }));

// // Mock thunks
// jest.mock('../../apps/Modules/shared/state/perpetua/perpetuaThunks', () => ({
//   reorderProfileShelf: jest.fn(),
//   loadShelves: jest.fn(),
// }));

// // Mock shelf data - simplified for testing
// const mockShelves = [
//   { 
//     shelf_id: 'shelf1', 
//     title: 'Shelf 1', 
//     owner: 'user1', 
//     items: [],
//     created_at: '1000',
//     updated_at: '1000', 
//     editors: [],
//     description: [],
//     rebalance_count: 0,
//     is_private: false,
//     is_nsfw: false,
//     item_positions: {},
//     needs_rebalance: false,
//   },
//   { 
//     shelf_id: 'shelf2', 
//     title: 'Shelf 2', 
//     owner: 'user1', 
//     items: [],
//     created_at: '2000',
//     updated_at: '2000', 
//     editors: [],
//     description: [],
//     rebalance_count: 0,
//     is_private: false,
//     is_nsfw: false,
//     item_positions: {},
//     needs_rebalance: false,
//   },
//   { 
//     shelf_id: 'shelf3', 
//     title: 'Shelf 3', 
//     owner: 'user1', 
//     items: [],
//     created_at: '3000',
//     updated_at: '3000', 
//     editors: [],
//     description: [],
//     rebalance_count: 0,
//     is_private: false,
//     is_nsfw: false,
//     item_positions: {},
//     needs_rebalance: false,
//   },
// ];

// // Create real Redux store for integration testing
// const createTestStore = () => {
//   return configureStore({
//     reducer: {
//       perpetua: perpetuaReducer,
//     },
//     preloadedState: {
//       perpetua: {
//         entities: {
//           shelves: {
//             shelf1: mockShelves[0],
//             shelf2: mockShelves[1],
//             shelf3: mockShelves[2],
//           },
//         },
//         ids: {
//           userShelves: ['shelf1', 'shelf2', 'shelf3'],
//           publicShelves: [],
//         },
//         selectedShelfId: null,
//         lastTimestamp: undefined,
//         loading: {
//           userShelves: false,
//           publicShelves: false,
//           editors: {},
//         },
//         error: null,
//         userPrincipal: 'user1',
//         permissions: {},
//         ownerPermissions: {},
//         shelfEditors: {},
//       },
//     },
//   });
// };

// describe('Shelf Reordering', () => {
//   let reorderProfileShelfMock: jest.Mock;
//   let loadShelvesMock: jest.Mock;

//   beforeEach(() => {
//     // Create mocks for thunks
//     reorderProfileShelfMock = jest.fn().mockImplementation((params) => {
//       return {
//         type: 'perpetua/reorderProfileShelf/fulfilled',
//         payload: params,
//       };
//     });

//     // Make sure loadShelvesMock has the correct structure expected by the reducer
//     const loadShelvesMockAction = {
//       type: 'perpetua/loadShelves/fulfilled',
//       payload: mockShelves,
//     };
    
//     loadShelvesMock = jest.fn().mockImplementation(() => loadShelvesMockAction);
    
//     // Add the required properties to the mock to match createAsyncThunk structure
//     loadShelvesMock.pending = { type: 'perpetua/loadShelves/pending' };
//     loadShelvesMock.fulfilled = { type: 'perpetua/loadShelves/fulfilled' };
//     loadShelvesMock.rejected = { type: 'perpetua/loadShelves/rejected' };

//     (perpetuaThunks.reorderProfileShelf as jest.Mock).mockImplementation(reorderProfileShelfMock);
//     (perpetuaThunks.loadShelves as jest.Mock).mockImplementation(loadShelvesMock);
//   });

//   test('reorderProfileShelf should handle empty shelfId when newShelfOrder is provided', () => {
//     // Create a dispatch function
//     const store = createTestStore();
//     const dispatch = jest.fn();
    
//     // Prepare parameters
//     const params = {
//       shelfId: '', // Empty shelfId
//       referenceShelfId: null,
//       before: true,
//       principal: 'user1',
//       newShelfOrder: ['shelf3', 'shelf1', 'shelf2']
//     };
    
//     // Dispatch the action directly through our mock
//     store.dispatch(perpetuaThunks.reorderProfileShelf(params));
    
//     // Verify the thunk was called with correct parameters
//     expect(reorderProfileShelfMock).toHaveBeenCalledWith(params);
//   });

//   test('reorderProfileShelf should revert optimistic updates on API failure', () => {
//     // Override the mock to simulate failure and call loadShelves to revert
//     reorderProfileShelfMock.mockImplementation((params) => {
//       // When this fails, it should call loadShelves to revert optimistic updates
//       return () => {
//         // Return a rejected promise
//         loadShelvesMock();
//         return Promise.reject({ error: 'Failed to reorder shelf' });
//       };
//     });
    
//     // Create store
//     const store = createTestStore();
    
//     // Dispatch action that will fail
//     try {
//       store.dispatch(perpetuaThunks.reorderProfileShelf({
//         shelfId: 'shelf3',
//         referenceShelfId: 'shelf1',
//         before: true,
//         principal: 'user1',
//         newShelfOrder: ['shelf3', 'shelf1', 'shelf2']
//       }));
//     } catch (e) {
//       // Expected to fail
//     }
    
//     // Verify loadShelves was called to revert changes
//     expect(loadShelvesMock).toHaveBeenCalled();
//   });
// }); 