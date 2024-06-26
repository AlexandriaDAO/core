#!/usr/bin/env bash
make clean
make build

dfx stop
dfx start --background --clean
dfx deploy ucg_nft

dfx identity new alice --storage-mode=plaintext || true
dfx identity new bob --storage-mode=plaintext || true
YOU=$(dfx identity get-principal)
ALICE=$(dfx --identity alice identity get-principal)
BOB=$(dfx --identity bob identity get-principal)

echo '(*) Creating Token:'
dfx canister call ucg_nft create_token \
    "(record{
        token=record {
                name=\"test\";
                description=opt\"test description\"
        };
     })"


echo '(*) Metadata of the newly created Token:'
dfx canister call ucg_nft icrc7_token_metadata \
    "(vec{1})"

echo "(*) Owner of newly created Token:"
dfx canister call ucg_nft icrc7_owner_of \
    "(vec{1})"

echo "(*) List of $YOU tokens:"
dfx canister call ucg_nft icrc7_tokens_of \
    "(record{owner=principal\"$YOU\"}, null, null)"


echo '(*) Mint newly created Token:'
dfx canister call ucg_nft mint \
    "(record{
        token_id=1;
        holders=vec{record{owner=principal\"$YOU\"}}
    })"

echo "(*) List of $YOU tokens:"
dfx canister call ucg_nft icrc7_tokens_of \
    "(record{owner=principal\"$YOU\"}, null, null)"

echo '(*) Update Token:'
dfx canister call ucg_nft update_token \
    "(record{
        token_id=1;
        token=record {
                name=\"updated test\";
                description=opt\"updated test description\"
        };
     })"

echo '(*) Metadata of the newly created Token:'
dfx canister call ucg_nft icrc7_token_metadata \
    "(vec{1})"

echo "(*) Owner of newly created Token:"
dfx canister call ucg_nft icrc7_owner_of \
    "(vec{1})"

echo "(*) Transfer newly created Token to alice:"
dfx canister call ucg_nft icrc7_transfer \
    "(vec{record{
        to=record{owner=principal\"$ALICE\"};
        token_id=1
    }})"

echo "(*) Owner of newly created Token:"
dfx canister call ucg_nft icrc7_owner_of \
    "(vec{1})"
