all: build

build:
	rustup target add wasm32-unknown-unknown
	cargo install candid-extractor
	cargo build --release --target wasm32-unknown-unknown --package ucg_nft
	candid-extractor target/wasm32-unknown-unknown/release/ucg_nft.wasm > src/NFT/examples/ucg_nft/ucg_nft.did

run: build
	dfx start --clean --background
	dfx deploy --argument 'record {symbol="TT"; name="Testing Token";}' icrc7

clean:
	dfx stop
	rm -rf target
	rm Cargo.lock
	rm src/icrc7/icrc7.did
