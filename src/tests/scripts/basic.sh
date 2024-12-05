#! /bin/bash
set -x

: <<'COMMENT'
This canister will eventually be named 'alice'. It will be replicated into a bob and charlie canister. 

For now it takes its icp, swaps it for LBRY, burns it for ALEX, stakes it, and repeats.

Later we'll add in NFTs, so it owns NFTs, mints others, and is basically a full blown bot.

Here we speed up the minting parameters and process and see if the numbers check out on an exponentiated timeframe.

Timetable change is changed with: 
- STAKING_REWARD_PERCENTAGE in utils.rs
- REWARD_DISTRIBUTION_INTERVAL in script.rs
- Took a zero off of total_icp_allocated in update.rs
COMMENT

# Function to perform one cycle of operations
perform_cycle() {
    echo "=== Starting new cycle at $(date) ==="
    
    # Debug ICP balance before claim
    echo "ICP Balance before claim:"
    dfx canister call icp_ledger_canister icrc1_balance_of '(record { owner = principal "yn33w-uaaaa-aaaap-qpk5q-cai"; subaccount = null })'
    
    # CLAIM
    echo "Attempting claim..."
    dfx canister call tests claim_icp_reward "root"
    
    # Debug ICP balance after claim
    echo "ICP Balance after claim:"
    dfx canister call icp_ledger_canister icrc1_balance_of '(record { owner = principal "yn33w-uaaaa-aaaap-qpk5q-cai"; subaccount = null })'

    # SWAP
    ICP_BALANCE=$(dfx canister call icp_ledger_canister icrc1_balance_of '(record { owner = principal "yn33w-uaaaa-aaaap-qpk5q-cai"; subaccount = null })' | sed 's/[^0-9]*//g')
    ICP_BALANCE_INT=$((ICP_BALANCE / 100000000))
    echo "Attempting swap of $((ICP_BALANCE_INT - 1)) ICP..."
    dfx canister call tests swap "($(($ICP_BALANCE_INT - 1)), \"root\")"

    # Debug LBRY balance after swap
    echo "LBRY Balance after swap:"
    dfx canister call LBRY icrc1_balance_of '(record { owner = principal "yn33w-uaaaa-aaaap-qpk5q-cai"; subaccount = null })'

    # BURN
    LBRY_BALANCE=$(dfx canister call LBRY icrc1_balance_of '(record { owner = principal "yn33w-uaaaa-aaaap-qpk5q-cai"; subaccount = null })' | sed 's/[^0-9]*//g')
    TRANSFER_AMOUNT=$(echo "$LBRY_BALANCE * 0.05" | bc | sed 's/\..*$//')
    LBRY_BALANCE_INT=$((LBRY_BALANCE / 100000000))
    BURN_AMOUNT=$(echo "$LBRY_BALANCE_INT * 0.95" | bc | sed 's/\..*$//')
    
    echo "Attempting LBRY transfer of $TRANSFER_AMOUNT (raw amount)"
    echo "LBRY balance before transfer: $LBRY_BALANCE"
    
    # # plain burn 5% // This will be implemented in the canister (which is the rightful controller of the funds.)
    # dfx canister call LBRY icrc1_transfer "(record { 
    #     from_subaccount = null;
    #     to = record { owner = principal \"54fqz-5iaaa-aaaap-qkmqa-cai\"; subaccount = null };
    #     amount = $TRANSFER_AMOUNT;
    #     fee = null;
    #     memo = null;
    #     created_at_time = null;
    # })"

    # Debug LBRY balance after transfer
    echo "LBRY Balance after transfer:"
    dfx canister call LBRY icrc1_balance_of '(record { owner = principal "yn33w-uaaaa-aaaap-qpk5q-cai"; subaccount = null })'

    # swap burn 95%
    dfx canister call tests burn "($BURN_AMOUNT, \"root\")"

    # STAKE
    ALEX_BALANCE=$(dfx canister call ALEX icrc1_balance_of '(record { owner = principal "yn33w-uaaaa-aaaap-qpk5q-cai"; subaccount = null })' | sed 's/[^0-9]*//g')
    ALEX_BALANCE_INT=$((ALEX_BALANCE / 100000000))
    dfx canister call tests stake "($(($ALEX_BALANCE_INT - 100)), \"root\")"

    # Check balances for multiple accounts
    dfx canister call tests check_balances '(vec { "root"; })'
    dfx canister call icp_swap get_all_stakes
    dfx canister call icp_swap get_total_unclaimed_icp_reward
    dfx canister call ALEX icrc1_total_supply

    echo "Cycle completed at $(date)"
}

# Main loop
echo "Starting cycles at $(date)"
while true; do
    perform_cycle
    sleep 60
done

: <<'COMMENT'

Next steps: 
- Get a timed rythm and test on a loop.
- Turn this into an Alice Canister.
- Make this tests cansiter a triggers setup for alice.
- Store these along the way:     
  - Alex total supply.
  - LBRY total supply.
  - At the end get_total_LBRY_burn() from tokenomics.
- So basically loop these functions at random intervals.
    - If we assume 100 ICP is 10,000 LBRY, and we are able to cycle these every minute, it will take 60 Million Minutes, or 100,000 hours.
    - So I guess we need to increase the recycling rate and stress test this for mainnet. 

COMMENT