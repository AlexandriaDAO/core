.PHONY: all clean fresh ii xrc icrc7 icrc7-scion nft-manager alex-backend perpetua feed icp-swap tokenomics user system-api alex-wallet vetkd emporium logs asset-manager alex-revshare kairos ensure-identities clean-identities test icp-ledger lbry alex tokens frontend help

# Start dfx and basic setup
clean:
	@echo "Start clean dfx..."
	dfx stop
	dfx killall
	dfx start --background --clean

# Remove all project identities
clean-identities:
	@echo "Removing project identities..."
	@dfx identity remove minter 2>/dev/null || echo "Identity 'minter' not found"
	@dfx identity remove user_1 2>/dev/null || echo "Identity 'user_1' not found"
	@dfx identity remove user_2 2>/dev/null || echo "Identity 'user_2' not found"
	@dfx identity remove user_3 2>/dev/null || echo "Identity 'user_3' not found"
	@echo "Note: 'default' identity preserved (cannot be removed)"

# Fresh start - clean dfx and identities
fresh: clean-identities clean
	@echo "Fresh environment ready!"

# Deploy Internet Identity dependencies
ii:
	@echo "Deploying Internet Identity..."
	dfx deps pull
	dfx deps init
	dfx deps deploy
	dfx deps deploy internet_identity

# Deploy XRC canister
xrc:
	@echo "Deploying XRC canister..."
	dfx canister create xrc --specified-id uf6dk-hyaaa-aaaaq-qaaaq-cai --network local
	cargo build --release --target wasm32-unknown-unknown --package xrc
	candid-extractor target/wasm32-unknown-unknown/release/xrc.wasm > src/xrc/xrc.did
	dfx deploy xrc --specified-id uf6dk-hyaaa-aaaaq-qaaaq-cai --network local

# Setup ICRC7 canister
icrc7:
	@echo "Setting up ICRC7 canister..."
	dfx canister create icrc7 --specified-id 53ewn-qqaaa-aaaap-qkmqq-cai
	dfx build icrc7
	dfx canister update-settings icrc7 --add-controller 5sh5r-gyaaa-aaaap-qkmra-cai
	dfx canister update-settings icrc7 --add-controller $$(dfx identity get-principal)

# Setup ICRC7 SCION canister
icrc7-scion:
	@echo "Setting up ICRC7 Scion canister..."
	dfx canister create icrc7_scion --specified-id uxyan-oyaaa-aaaap-qhezq-cai
	dfx build icrc7_scion
	dfx canister update-settings icrc7_scion --add-controller 5sh5r-gyaaa-aaaap-qkmra-cai
	dfx canister update-settings icrc7_scion --add-controller $$(dfx identity get-principal)

# Deploy NFT Manager
nft-manager:
	@echo "Deploying NFT Manager..."
	cargo build --release --target wasm32-unknown-unknown --package nft_manager
	candid-extractor target/wasm32-unknown-unknown/release/nft_manager.wasm > src/nft_manager/nft_manager.did
	dfx deploy nft_manager --specified-id 5sh5r-gyaaa-aaaap-qkmra-cai

# Deploy Alex Backend
alex-backend:
	@echo "Deploying Alex Backend..."
	cargo build --release --target wasm32-unknown-unknown --package alex_backend
	candid-extractor target/wasm32-unknown-unknown/release/alex_backend.wasm > src/alex_backend/alex_backend.did
	dfx deploy alex_backend --specified-id y42qn-baaaa-aaaap-qkmnq-cai

# Deploy Perpetua
perpetua:
	@echo "Deploying Perpetua..."
	cargo build --release --target wasm32-unknown-unknown --package perpetua
	candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
	dfx deploy perpetua --specified-id ya6k4-waaaa-aaaap-qkmpq-cai

# Deploy Feed
feed:
	@echo "Deploying Feed..."
	cargo build --release --target wasm32-unknown-unknown --package feed
	candid-extractor target/wasm32-unknown-unknown/release/feed.wasm > src/feed/feed.did
	dfx deploy feed --specified-id okj2q-daaaa-aaaap-qp2pa-cai

# Deploy ICP Swap
icp-swap:
	@echo "Deploying ICP Swap..."
	cargo build --release --target wasm32-unknown-unknown --package icp_swap
	candid-extractor target/wasm32-unknown-unknown/release/icp_swap.wasm > src/icp_swap/icp_swap.did
	dfx deploy icp_swap --specified-id 54fqz-5iaaa-aaaap-qkmqa-cai

# Deploy Tokenomics
tokenomics:
	@echo "Deploying Tokenomics..."
	cargo build --release --target wasm32-unknown-unknown --package tokenomics
	candid-extractor target/wasm32-unknown-unknown/release/tokenomics.wasm > src/tokenomics/tokenomics.did
	dfx deploy tokenomics --specified-id 5abki-kiaaa-aaaap-qkmsa-cai

# Deploy Authentication
authentication:
	@echo "Deploying Authentication..."
	cargo build --release --target wasm32-unknown-unknown --package authentication
	candid-extractor target/wasm32-unknown-unknown/release/authentication.wasm > src/authentication/authentication.did
	dfx deploy authentication --specified-id uxrrr-q7777-77774-qaaaq-cai

# Deploy User
user:
	@echo "Deploying User..."
	cargo build --release --target wasm32-unknown-unknown --package user
	candid-extractor target/wasm32-unknown-unknown/release/user.wasm > src/user/user.did
	dfx deploy user --specified-id yo4hu-nqaaa-aaaap-qkmoq-cai

# Deploy Stripe
stripe:
	@echo "Deploying Stripe..."
	cargo build --release --target wasm32-unknown-unknown --package stripe
	candid-extractor target/wasm32-unknown-unknown/release/stripe.wasm > src/stripe/stripe.did
	dfx deploy stripe --specified-id uzt4z-lp777-77774-qaabq-cai

# Deploy System API
system-api:
	@echo "Deploying System API..."
	dfx deploy system_api --specified-id 5vg3f-laaaa-aaaap-qkmrq-cai

# Deploy Alex Wallet
alex-wallet:
	@echo "Deploying Alex Wallet..."
	cargo build --release --target wasm32-unknown-unknown --package alex_wallet
	candid-extractor target/wasm32-unknown-unknown/release/alex_wallet.wasm > src/alex_wallet/alex_wallet.did
	dfx deploy alex_wallet --specified-id yh7mi-3yaaa-aaaap-qkmpa-cai

# Deploy VetKD
vetkd:
	@echo "Deploying VetKD..."
	cargo build --release --target wasm32-unknown-unknown --package vetkd
	candid-extractor target/wasm32-unknown-unknown/release/vetkd.wasm > src/vetkd/vetkd.did
	dfx deploy vetkd --specified-id 5ham4-hqaaa-aaaap-qkmsq-cai

# Deploy Emporium
emporium:
	@echo "Deploying Emporium..."
	cargo build --release --target wasm32-unknown-unknown --package emporium
	candid-extractor target/wasm32-unknown-unknown/release/emporium.wasm > src/emporium/emporium.did
	dfx deploy emporium --specified-id zdcg2-dqaaa-aaaap-qpnha-cai

# Deploy Logs
logs:
	@echo "Deploying Logs..."
	cargo build --release --target wasm32-unknown-unknown --package logs
	candid-extractor target/wasm32-unknown-unknown/release/logs.wasm > src/logs/logs.did
	dfx deploy logs --specified-id yn33w-uaaaa-aaaap-qpk5q-cai

# Deploy Asset Manager
asset-manager:
	@echo "Deploying Asset Manager..."
	cargo build --release --target wasm32-unknown-unknown --package asset_manager
	candid-extractor target/wasm32-unknown-unknown/release/asset_manager.wasm > src/asset_manager/asset_manager.did
	dfx deploy asset_manager --specified-id zhcno-qqaaa-aaaap-qpv7a-cai
	dfx ledger fabricate-cycles --canister zhcno-qqaaa-aaaap-qpv7a-cai --cycles 10000000000000000

# Deploy Alex Revshare
alex-revshare:
	@echo "Deploying Alex Revshare..."
	cargo build --release --target wasm32-unknown-unknown --package alex_revshare
	candid-extractor target/wasm32-unknown-unknown/release/alex_revshare.wasm > src/alex_revshare/alex_revshare.did
	dfx deploy alex_revshare --specified-id e454q-riaaa-aaaap-qqcyq-cai

# Deploy Kairos
kairos:
	@echo "Deploying Kairos..."
	cargo build --release --target wasm32-unknown-unknown --package kairos
	candid-extractor target/wasm32-unknown-unknown/release/kairos.wasm > src/kairos/kairos.did
	dfx deploy kairos
	dfx generate kairos

# Ensure all required identities exist (without switching current identity)
ensure-identities:
	@echo "Ensuring identities exist..."
	@dfx identity get-principal --identity default >/dev/null 2>&1 || dfx identity new default >/dev/null 2>&1
	@dfx identity get-principal --identity minter >/dev/null 2>&1 || dfx identity new minter --storage-mode plaintext >/dev/null 2>&1
	@dfx identity get-principal --identity user_1 >/dev/null 2>&1 || dfx identity new user_1 --storage-mode plaintext >/dev/null 2>&1
	@dfx identity get-principal --identity user_2 >/dev/null 2>&1 || dfx identity new user_2 --storage-mode plaintext >/dev/null 2>&1
	@dfx identity get-principal --identity user_3 >/dev/null 2>&1 || dfx identity new user_3 --storage-mode plaintext >/dev/null 2>&1

# Deploy ICP Ledger (LICP)
icp-ledger:
	@echo "Deploying ICP Ledger (LICP)..."
	dfx deploy --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai icp_ledger_canister --argument \
	"(variant { \
		Init = record { \
			minting_account = \"$$(dfx ledger account-id --of-principal $$(dfx identity get-principal --identity minter))\"; \
			initial_values = vec { \
				record { \
					\"$$(dfx ledger account-id --of-principal $$(dfx identity get-principal --identity default))\"; \
					record { e8s = 100_000_000_000_000_000 : nat64; }; \
				}; \
				record { \
					\"$$(dfx ledger account-id --of-principal $$(dfx identity get-principal --identity user_1))\"; \
					record { e8s = 1_000_000_000 : nat64; }; \
				}; \
				record { \
					\"$$(dfx ledger account-id --of-principal $$(dfx identity get-principal --identity user_2))\"; \
					record { e8s = 1_000_000_000 : nat64; }; \
				}; \
				record { \
					\"$$(dfx ledger account-id --of-principal $$(dfx identity get-principal --identity user_3))\"; \
					record { e8s = 1_000_000_000 : nat64; }; \
				}; \
			}; \
			send_whitelist = vec {}; \
			transfer_fee = opt record { e8s = 10_000 : nat64; }; \
			token_symbol = opt \"LICP\"; \
			token_name = opt \"Local ICP\"; \
		} \
	})"

# Deploy LBRY Token
lbry:
	@echo "Deploying LBRY Token..."
	dfx deploy LBRY --specified-id y33wz-myaaa-aaaap-qkmna-cai --argument \
	"(variant { \
		Init = record { \
			token_symbol = \"LBRY\"; \
			token_name = \"LBRY\"; \
			minting_account = record { owner = principal \"$$(dfx canister id icp_swap)\" }; \
			transfer_fee = 4_000_000; \
			metadata = vec {}; \
			initial_balances = vec {}; \
			archive_options = record { \
				num_blocks_to_archive = 1000; \
				trigger_threshold = 2000; \
				controller_id = principal \"$$(dfx canister id icp_swap)\"; \
			}; \
			feature_flags = opt record { icrc2 = true; }; \
		} \
	})"

# Deploy ALEX Token
alex:
	@echo "Deploying ALEX Token..."
	dfx deploy ALEX --specified-id ysy5f-2qaaa-aaaap-qkmmq-cai --argument \
	"(variant { \
		Init = record { \
			token_symbol = \"ALEX\"; \
			token_name = \"ALEX\"; \
			minting_account = record { owner = principal \"$$(dfx canister id tokenomics)\" }; \
			transfer_fee = 10_000; \
			metadata = vec {}; \
			initial_balances = vec {}; \
			archive_options = record { \
				num_blocks_to_archive = 1000; \
				trigger_threshold = 2000; \
				controller_id = principal \"$$(dfx canister id tokenomics)\"; \
			}; \
			feature_flags = opt record { icrc2 = true; }; \
		} \
	})"


# Deploy all tokens
tokens: ensure-identities icp-ledger lbry alex

# Main target - runs all setup commands
all: fresh ii xrc icrc7 icrc7-scion nft-manager alex-backend perpetua feed icp-swap tokenomics authentication user stripe system-api alex-wallet vetkd emporium logs asset-manager alex-revshare tokens

# Help target
help:
	@echo "Available targets:"
	@echo "  all               - Run complete build process"
	@echo "  clean             - Start dfx with clean state"
	@echo "  fresh             - Clean dfx and remove identities (full reset)"
	@echo "  ii                - Deploy Internet Identity dependencies"
	@echo "  xrc               - Deploy XRC canister"
	@echo "  icrc7             - Setup ICRC7 canister"
	@echo "  icrc7-scion       - Setup ICRC7 Scion canister"
	@echo "  nft-manager       - Deploy NFT Manager"
	@echo "  alex-backend      - Deploy Alex Backend"
	@echo "  perpetua          - Deploy Perpetua"
	@echo "  feed              - Deploy Feed"
	@echo "  icp-swap          - Deploy ICP Swap"
	@echo "  tokenomics        - Deploy Tokenomics"
	@echo "  user              - Deploy User"
	@echo "  system-api        - Deploy System API"
	@echo "  alex-wallet       - Deploy Alex Wallet"
	@echo "  vetkd             - Deploy VetKD"
	@echo "  emporium          - Deploy Emporium"
	@echo "  logs              - Deploy Logs"
	@echo "  asset-manager     - Deploy Asset Manager"
	@echo "  alex-revshare     - Deploy Alex Revshare"
	@echo "  kairos            - Deploy Kairos canister"
	@echo "  ensure-identities - Ensure all required identities, Create if don't exist"
	@echo "  clean-identities  - Remove all project identities"
	@echo "  icp-ledger        - Deploy ICP Ledger (LICP)"
	@echo "  lbry              - Deploy LBRY Token"
	@echo "  alex              - Deploy ALEX Token"
	@echo "  tokens            - Deploy all tokens"
	@echo "  frontend          - Deploy authentication providers and frontend"
	@echo "  test              - Test identity commands"
	@echo "  help              - Show this help message"