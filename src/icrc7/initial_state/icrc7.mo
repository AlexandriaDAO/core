import ICRC7 "mo:icrc7-mo";
import Principal "mo:base/Principal";

module{
  public let defaultConfig = func(caller: Principal) : ICRC7.InitArgs{
      ?{
        symbol = ?"ALEX";
        name = ?"Alexandria";
        description = ?"The official NFT Collection of the Alexandria Project";
        logo = ?"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iX9Cw0YBfMSIgZGF0YS1uYW1lPSLQqNCw0YAgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDEyMDAgMTIwMCI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogdXJsKCNf0YDQsNC00ZbRlNC90YJf0LHQtdC3X9C90LDQt9Cy0LhfMik7CiAgICAgIH0KCiAgICAgIC5jbHMtMiB7CiAgICAgICAgZmlsbDogIzM1MzUzNTsKICAgICAgfQogICAgPC9zdHlsZT4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iX9GA0LDQtNGW0ZTQvdGCX9Cx0LXQt1/QvdCw0LfQstC4XzIiIGRhdGEtbmFtZT0i0JPRgNCw0LTRltGU0L3RgiDQsdC10Lcg0L3QsNC30LLQuCAyIiB4MT0iNjAwIiB5MT0iOTQ1LjI3IiB4Mj0iNjAwIiB5Mj0iMjU5LjU2IiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMTIwMi40Mikgc2NhbGUoMSAtMSkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjOTY3ZTU5Ii8+CiAgICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2VhYzU4MiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNjAwLDBoMGMzMzEuMzcsMCw2MDAsMjY4LjYzLDYwMCw2MDBoMGMwLDMzMS4zNy0yNjguNjMsNjAwLTYwMCw2MDBoMEMyNjguNjMsMTIwMCwwLDkzMS4zNywwLDYwMEgwQzAsMjY4LjYzLDI2OC42MywwLDYwMCwwWiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTI3OC41Nyw5NDIuODZMNjAwLDI1Ny4xNGwzMjEuNDMsNjg1LjcxSDI3OC41N1ptNTAxLjM5LTEwNC40bC0xNzkuOTYtNDU0Ljc1LTE3MC4yMywyOTEuOTMtNzUuNiwxMzMuNjEtNzUuNiwxMzMuNjEsNTAxLjM5LTEwNC40WiIvPgo8L3N2Zz4=";
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



