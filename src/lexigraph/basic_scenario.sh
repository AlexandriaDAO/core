set -x

dfx canister uninstall-code lexigraph


cargo build --release --target wasm32-unknown-unknown --package lexigraph
candid-extractor target/wasm32-unknown-unknown/release/lexigraph.wasm > src/lexigraph/lexigraph.did
dfx deploy lexigraph --specified-id ya6k4-waaaa-aaaap-qkmpq-cai


# Create a simple shelf with mixed content (Markdown and NFT)
dfx canister call lexigraph store_shelf '(
  "My Digital Art Collection",
  opt "A simple showcase of digital art with commentary",
  vec {
    record {
      id = 1;
      content = variant { Markdown = "# Welcome\n\nThis is a simple showcase of digital art." };
      position = 0;
    };
    record {
      id = 2;
      content = variant { Nft = "nft_1234" };
      position = 1;
    };
    record {
      id = 3;
      content = variant { Markdown = "This NFT represents the future of digital art." };
      position = 2;
    }
  }
)'

# Store the shelf_id for later use
SHELF_ID=$(dfx canister call lexigraph get_user_shelves '(principal "'$(dfx identity get-principal)'", null)' | grep 'shelf_id' | sed -E 's/.*shelf_id = "([^"]+)".*/\1/')

# Verify the shelf was created
dfx canister call lexigraph get_shelf "\"$SHELF_ID\""

# Reorder slots to put NFT description before the NFT
dfx canister call lexigraph reorder_shelf_slot "(
  \"$SHELF_ID\",
  record {
    slot_id = 3;
    reference_slot_id = opt 2;
    before = true;
  }
)"

# Verify the reordering
dfx canister call lexigraph get_shelf_slots "\"$SHELF_ID\""

# Add a new slot
dfx canister call lexigraph add_shelf_slot "(
  \"$SHELF_ID\",
  record {
    content = variant { Markdown = \"## Future Updates\n\nMore art coming soon!\" };
    reference_slot_id = opt 3;
    before = false;
  }
)"

# Verify the new slot was added
dfx canister call lexigraph get_shelf_slots "\"$SHELF_ID\""

# Delete the shelf
dfx canister call lexigraph delete_shelf "\"$SHELF_ID\""

# Verify the shelf was deleted (should return an error)
dfx canister call lexigraph get_shelf "\"$SHELF_ID\""