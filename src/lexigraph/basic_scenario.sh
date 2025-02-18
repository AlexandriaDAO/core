dfx canister uninstall-code lexigraph


cargo build --release --target wasm32-unknown-unknown --package lexigraph
candid-extractor target/wasm32-unknown-unknown/release/lexigraph.wasm > src/lexigraph/lexigraph.did
dfx deploy lexigraph --specified-id ya6k4-waaaa-aaaap-qkmpq-cai


# Create a shelf with mixed content (Markdown and NFT references)
dfx canister call lexigraph store_shelf '(
  "My Digital Art Collection",
  opt "A curated collection of my favorite digital art pieces with commentary",
  vec {
    record {
      id = 1;
      content = variant { Markdown = "# Welcome to My Collection\n\nThis shelf showcases some of my favorite digital art pieces along with my thoughts on each piece." };
      position = 0;
    };
    record {
      id = 2;
      content = variant { Nft = "nft_1234" };
      position = 1;
    };
    record {
      id = 3;
      content = variant { Markdown = "This piece represents the intersection of traditional art and blockchain technology. The use of color and composition is particularly striking." };
      position = 2;
    };
    record {
      id = 4;
      content = variant { Nft = "nft_5678" };
      position = 3;
    };
    record {
      id = 5;
      content = variant { Markdown = "The artist'\''s technique in this piece demonstrates mastery of digital medium while maintaining classical artistic principles." };
      position = 4;
    }
  }
)'

# Store the shelf_id for later use
SHELF_ID=$(dfx canister call lexigraph get_user_shelves '(principal "'$(dfx identity get-principal)'", null)' | grep 'shelf_id' | sed -E 's/.*shelf_id = "([^"]+)".*/\1/')

# Reorder slots to put NFTs next to their descriptions
# Move the first NFT's description before the NFT
dfx canister call lexigraph reorder_shelf_slot "(
  \"$SHELF_ID\",
  record {
    slot_id = 3;
    reference_slot_id = opt 2;
    before = true;
  }
)"

# Move the second NFT's description before the NFT
dfx canister call lexigraph reorder_shelf_slot "(
  \"$SHELF_ID\",
  record {
    slot_id = 5;
    reference_slot_id = opt 4;
    before = true;
  }
)"

# Update the shelf with new content
dfx canister call lexigraph update_shelf "(
  \"$SHELF_ID\",
  record {
    title = opt \"My Evolving Digital Art Collection\";
    description = opt \"An ever-growing curation of digital art with detailed commentary\";
    slots = opt vec {
      record {
        id = 1;
        content = variant { Markdown = \"# Welcome to My Collection\n\nThis shelf showcases some of my favorite digital art pieces along with my thoughts on each piece. Updated with new perspectives.\" };
        position = 0;
      };
      record {
        id = 3;
        content = variant { Markdown = \"This piece represents the intersection of traditional art and blockchain technology. The use of color and composition is particularly striking. After living with this piece, I've noticed new details in the background.\" };
        position = 1;
      };
      record {
        id = 2;
        content = variant { Nft = \"nft_1234\" };
        position = 2;
      };
      record {
        id = 5;
        content = variant { Markdown = \"The artist's technique in this piece demonstrates mastery of digital medium while maintaining classical artistic principles. The recent NFT market activity has made this piece even more significant.\" };
        position = 3;
      };
      record {
        id = 4;
        content = variant { Nft = \"nft_5678\" };
        position = 4;
      };
      record {
        id = 6;
        content = variant { Markdown = \"## Collection Updates\n\nStay tuned for more additions to this collection as I discover new pieces that resonate with my artistic vision.\" };
        position = 5;
      }
    }
  }
)"

# Query the updated shelf to see the changes
dfx canister call lexigraph get_shelf "\"$SHELF_ID\""

# Get just the ordered slots
dfx canister call lexigraph get_shelf_slots "\"$SHELF_ID\""

# View all user shelves
dfx canister call lexigraph get_user_shelves "(principal \"$(dfx identity get-principal)\", null)"