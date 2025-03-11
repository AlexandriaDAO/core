import addWalletReducer, { reset } from "../addWalletSlice";
import importKeyFile from "../thunks/importKeyFile";
import importSeedPhrase from "../thunks/importSeedPhrase";
import generateNewWallet from "../thunks/generateNewWallet";
import { toast } from "sonner";

// Mock toast notifications
jest.mock("sonner", () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
	},
}));

describe("addWalletSlice", () => {
	const initialState = {
		wallet: null,
		importing: false,
		importError: null,
		generating: false,
		generateError: null,
		storing: false,
		storeError: null,
	};

	beforeEach(() => {
		// Reset the state and clear mocks before each test
		jest.clearAllMocks();
	});

	it("should return the initial state", () => {
		expect(addWalletReducer(undefined, { type: "unknown" })).toEqual(
			initialState
		);
	});

	it("should handle reset action", () => {
		const modifiedState = {
			...initialState,
			wallet: { address: "test", key: {} as any },
			importError: "Some error",
		};

		expect(addWalletReducer(modifiedState, reset())).toEqual(initialState);
	});

	// Test importKeyFile cases
	describe("importKeyFile", () => {
		it("should set importing to true when importKeyFile is pending", () => {
			const action = { type: importKeyFile.pending.type };
			const state = addWalletReducer(initialState, action);

			expect(state.importing).toBe(true);
			expect(state.importError).toBeNull();
		});

		it("should set wallet and reset importing when importKeyFile is fulfilled", () => {
			const mockPayload = {
				address: "wallet-address-123",
				key: { n: "test-key" },
			};

			const action = {
				type: importKeyFile.fulfilled.type,
				payload: mockPayload,
			};

			const state = addWalletReducer(initialState, action);

			expect(state.importing).toBe(false);
			expect(state.wallet).toEqual({
				address: mockPayload.address,
				key: mockPayload.key,
			});
			expect(toast.success).toHaveBeenCalledWith(
				"Wallet imported successfully"
			);
		});

		it("should set importError when importKeyFile is rejected", () => {
			const errorMessage = "Failed to import key file";
			const action = {
				type: importKeyFile.rejected.type,
				payload: errorMessage,
			};

			const state = addWalletReducer(initialState, action);

			expect(state.importing).toBe(false);
			expect(state.importError).toBe(errorMessage);
			expect(toast.error).toHaveBeenCalledWith(
				"Error importing wallet. Please check your key file."
			);
		});

		// it("should handle empty payload in importKeyFile.fulfilled", () => {
		// 	const action = {
		// 		type: importKeyFile.fulfilled.type,
		// 		payload: {} as any, // Simulate empty payload
		// 	};

		// 	const state = addWalletReducer(initialState, action);

		// 	expect(state.importing).toBe(false);
		// 	expect(state.wallet).toBeNull(); // Wallet should not be set
		// 	expect(toast.success).not.toHaveBeenCalled();
		// });
		it("should handle empty payload in importKeyFile.fulfilled", () => {
			const action = {
				type: importKeyFile.fulfilled.type,
				payload: {}, // Empty payload
			};

			const state = addWalletReducer(initialState, action);

			expect(state.importing).toBe(false);
			expect(state.wallet).toBeNull(); // Wallet should be null
			expect(toast.error).toHaveBeenCalledWith(
				"Invalid key file. Please try again."
			);
			expect(toast.success).not.toHaveBeenCalled();
		});
	});

	// Test importSeedPhrase cases
	describe("importSeedPhrase", () => {
		it("should set importing to true when importSeedPhrase is pending", () => {
			const action = { type: importSeedPhrase.pending.type };
			const state = addWalletReducer(initialState, action);

			expect(state.importing).toBe(true);
			expect(state.importError).toBeNull();
		});

		it("should set wallet with seed when importSeedPhrase is fulfilled", () => {
			const mockPayload = {
				address: "wallet-address-123",
				key: { n: "test-key" },
				seed: "test seed phrase",
			};

			const action = {
				type: importSeedPhrase.fulfilled.type,
				payload: mockPayload,
			};

			const state = addWalletReducer(initialState, action);

			expect(state.importing).toBe(false);
			expect(state.wallet).toEqual({
				address: mockPayload.address,
				key: mockPayload.key,
				seed: mockPayload.seed,
			});
			expect(toast.success).toHaveBeenCalledWith(
				"Wallet imported successfully"
			);
		});

		it("should set importError when importSeedPhrase is rejected", () => {
			const errorMessage = "Invalid seed phrase";
			const action = {
				type: importSeedPhrase.rejected.type,
				payload: errorMessage,
			};

			const state = addWalletReducer(initialState, action);

			expect(state.importing).toBe(false);
			expect(state.importError).toBe(errorMessage);
			expect(toast.error).toHaveBeenCalledWith(
				"Error creating wallet from seed phrase."
			);
		});

		it("should handle missing seed in importSeedPhrase.fulfilled", () => {
			const mockPayload = {
				address: "wallet-address-123",
				key: { n: "test-key" },
				// seed is missing
			};

			const action = {
				type: importSeedPhrase.fulfilled.type,
				payload: mockPayload,
			};

			const state = addWalletReducer(initialState, action);

			expect(state.importing).toBe(false);
			expect(state.wallet).toEqual({
				address: mockPayload.address,
				key: mockPayload.key,
				seed: undefined, // Seed should be undefined
			});
		});
	});

	// Test generateNewWallet cases
	describe("generateNewWallet", () => {
		it("should set generating to true when generateNewWallet is pending", () => {
			const action = { type: generateNewWallet.pending.type };
			const state = addWalletReducer(initialState, action);

			expect(state.generating).toBe(true);
			expect(state.generateError).toBeNull();
		});

		it("should set wallet with new flag when generateNewWallet is fulfilled", () => {
			const mockPayload = {
				address: "new-wallet-address-123",
				key: { n: "new-test-key" },
				seedPhrase: "generated seed phrase",
			};

			const action = {
				type: generateNewWallet.fulfilled.type,
				payload: mockPayload,
			};

			const state = addWalletReducer(initialState, action);

			expect(state.generating).toBe(false);
			expect(state.wallet).toEqual({
				new: true,
				address: mockPayload.address,
				key: mockPayload.key,
				seed: mockPayload.seedPhrase,
			});
			expect(toast.success).toHaveBeenCalledWith(
				"New wallet generated! Please save your key file safely."
			);
		});

		it("should set generateError when generateNewWallet is rejected", () => {
			const errorMessage = "Failed to generate wallet";
			const action = {
				type: generateNewWallet.rejected.type,
				payload: errorMessage,
			};

			const state = addWalletReducer(initialState, action);

			expect(state.generating).toBe(false);
			expect(state.generateError).toBe(errorMessage);
			expect(toast.error).toHaveBeenCalledWith(
				"Error generating new wallet."
			);
		});

		it("should handle missing seedPhrase in generateNewWallet.fulfilled", () => {
			const mockPayload = {
				address: "new-wallet-address-123",
				key: { n: "new-test-key" },
				// seedPhrase is missing
			};

			const action = {
				type: generateNewWallet.fulfilled.type,
				payload: mockPayload,
			};

			const state = addWalletReducer(initialState, action);

			expect(state.generating).toBe(false);
			expect(state.wallet).toEqual({
				new: true,
				address: mockPayload.address,
				key: mockPayload.key,
				seed: undefined, // Seed should be undefined
			});
		});
	});
});