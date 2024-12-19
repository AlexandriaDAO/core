Fixes:
- fetch_total_minted_ALEX() does not work as a query call because it makes an inter-canister call. It'd be nice for us to be able to call it as well.
- You don't use get_canister_id() in the lib.rs file of tokenomics. I removed it.



Questions:
- What are the consequences of not using max LBRY burn allowed?




## Major Vulnerabilities:

### Update.rs
// For the main caller, errors stop execution:
match mint_ALEX_internal(alex_per_recipient, actual_caller).await {
    Ok(_) => { /* ... */ }
    Err(_) => return Err("Something went wrong".to_string()),
}

// But for random users, errors are just logged:
match mint_ALEX_internal(alex_per_recipient, random_users.0).await {
    Ok(_) => { /* ... */ }
    Err(_) => update_log(/* ... */), // Continues execution
}

This means if minting fails for random users, the LBRY is still burned but not all ALEX is minted. This creates an accounting mismatch.


-- If anything fails between burning LBRY and these updates, the system state becomes inconsistent. There's no rollback mechanism.


- Everything is by principal, not account, so I have to add subaccount to everything.
- Mint failure does not rollback the LBRY burn.







Mainnet test resutlts: 



Mainnet accuracy testing: /

LBRY Burned: 674_288
Burned 36,284.
LBRY Burned: 710,572 
Buring: 160715
LBRY Burned: 871_287 
...
Burned: 87278
Total burned: 958_565 
Burned: 41435
Total burned: 1_000_000
Burned: 100_000
Total burned: 1_100_000
Burned: 150_000
Total burned: 1_250_000
Burned: 75_000
Total burned: 1_325_000
Burned 18987
Total burned: 1_343_987
Burned 10
Total burned: 1_343_997
The goal is to get to 1_344_000, the next threshold.


So at 1_343_997 LBRY Burned, the current threshold is 1_344_000, the supply is 1_259_894.18930 ALEX, and the current mint rate is 781.


At 1_343_999 LBRY Burned, the current threshold is 1_344_000, the supply is 1_259_895.79 ALEX, and the current mint rate is 781.

At 1_344_000 LBRY Burned, the current threshold is 1_344_000, the supply is 1_259_894.89 ALEX, and the current mint rate is 781.


1,260,000.00 ( so presumably we lost 105ish ALEX in transaction fees. )


1_344_001

100 / 0.0001 = 1000000





