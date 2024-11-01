import ICRC7 "mo:icrc7-mo";
import Principal "mo:base/Principal";

module{
  public let defaultConfig = func(caller: Principal) : ICRC7.InitArgs{
      ?{
        symbol = ?"ALEX";
        name = ?"Alexandria";
        description = ?"The official NFT Collection of the Alexandria Project";
        logo = ?"https://yj5ba-aiaaa-aaaap-qkmoa-cai.icp0.io/images/logo.png";
        supply_cap = null;
        allow_transfers = null;
        atomic_batch_transfers = true;
        max_query_batch_size = ?100;
        max_update_batch_size = ?20;
        default_take_value = ?100;
        max_take_value = ?20000;
        max_memo_size = ?512;
        permitted_drift = null;
        tx_window = null;
        burn_account = null; //burned nfts are deleted
        deployer = caller;
        supported_standards = null;
      };
  };
};


// We use this burn_account with interenal logic of unverified nfts. If unverified NFTs are burned by their users, they belong to the NFT_manager canister until the DAO decides to burn it.
// For actually burning to the null address, only owners of verified nfts are allowed to do this.
        // burn_account = ?{
        //   owner = Principal.fromText("53ewn-qqaaa-aaaap-qkmqq-cai");
        //   subaccount = null;
        // };        

// // Defaults:

// import ICRC7 "mo:icrc7-mo";

// module{
//   public let defaultConfig = func(caller: Principal) : ICRC7.InitArgs{
//       ?{
//         symbol = ?"ALEX";
//         name = ?"Alexandria";
//         description = ?"The official NFT Collection of the Alexandria Project";
//         logo = ?"https://yj5ba-aiaaa-aaaap-qkmoa-cai.icp0.io/images/logo.png";
//         supply_cap = null;
//         allow_transfers = null;
//         max_query_batch_size = ?100;
//         max_update_batch_size = ?100;
//         default_take_value = ?1000;
//         max_take_value = ?10000;
//         max_memo_size = ?512;
//         permitted_drift = null;
//         tx_window = null;
//         burn_account = null; //burned nfts are deleted
//         deployer = caller;
//         supported_standards = null;
//       };
//   };
// };



