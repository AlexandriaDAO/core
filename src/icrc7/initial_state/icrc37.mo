import ICRC37 "mo:icrc37-mo";

module{
  public let defaultConfig = func(caller: Principal) : ICRC37.InitArgs{
    ?{
        max_approvals_per_token_or_collection = ?1;
        max_revoke_approvals = ?10;
        collection_approval_requires_token = ?true;
        max_approvals = ?10_000;
        settle_to_approvals = ?9_975;
        deployer = caller;
    }; 
  };
};



// // Defaults:
// import ICRC37 "mo:icrc37-mo";

// module{
//   public let defaultConfig = func(caller: Principal) : ICRC37.InitArgs{
//     ?{
//         max_approvals_per_token_or_collection = ?10;
//         max_revoke_approvals = ?100;
//         collection_approval_requires_token = ?true;
//         max_approvals = null;
//         settle_to_approvals = null;
//         deployer = caller;
//     }; 
//   };
// };