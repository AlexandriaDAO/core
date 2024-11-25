#! /bin/bash

: <<'COMMENT'
The goal is to get alice, bob, and charlie swapping at the same time,
and collecting their staking rewards very rapidly, and recycling them 
back into the swap as quickly as possible.

Step 1: Just get alice to perform a swap, and write a test to cofirm that it was done.

They each have 10 ICP by default.
COMMENT



dfx identity use user_1
export ALICE_ACCOUNT_ID=$(dfx ledger account-id)
export ALICE_PRINCIPAL=$(dfx identity get-principal)
dfx identity use user_2
export BOB_ACCOUNT_ID=$(dfx ledger account-id)
export BOB_PRINCIPAL=$(dfx identity get-principal)
dfx identity use user_3
export CHARLIE_ACCOUNT_ID=$(dfx ledger account-id)
export CHARLIE_PRINCIPAL=$(dfx identity get-principal)

# First verify the identity matches what we expect
dfx identity use user_1

# Verify ICP balance before swap
dfx ledger balance

# First approve the swap canister to spend ICP tokens
dfx canister call icp_ledger_canister icrc2_approve '(record {
    spender = record { 
        owner = principal "'$(dfx canister id icp_swap)'"; 
        subaccount = null 
    };
    amount = 100_010_000;
    fee = opt 10_000;
    memo = null;
    from_subaccount = null;
    created_at_time = null;
    expected_allowance = null;
    expires_at = null;
})'

# Then make the swap call
dfx canister call icp_swap swap "(100_000_000)"

# Check both ICP and token balances after swap
echo "ICP balance after swap:"
dfx ledger balance

echo "Token balance after swap:"
# dfx canister call icp_swap icrc1_balance_of "(record {owner=principal \"$ALICE_PRINCIPAL\"; subaccount=null})"

# Check alice's balance