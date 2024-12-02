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