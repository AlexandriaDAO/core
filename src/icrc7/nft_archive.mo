import ICRC7 "mo:icrc7-mo";
import Principal "mo:base/Principal";
import D "mo:base/Debug";
import Array "mo:base/Array";

module {
  // Define a type for the variable parts of each NFT
  type NFTData = {
    token_id: Nat;
    owner: Principal;
    description: Text;
  };

  public func initialize_nfts(icrc7: ICRC7.ICRC7, caller: Principal) : async () {
    let base_nft : ICRC7.SetNFTItemRequest = {
      created_at_time = null;
      memo = null;
      metadata = #Text(""); // Use an empty string as a placeholder
      override = false;
      owner = null; // This will be overwritten
      token_id = 0; // This will be overwritten
    };

    // Define the variable data for each NFT
    let nft_data : [NFTData] = [
      { token_id = 101_402_859_615_123_070_939_606_806_776_952_079_016_618_008_609_101_970_860_422_354_949_319_130_091_570; owner = Principal.fromText("n3br6-rkkdh-5jcq7-pbwsx-yeqm7-jbzqi-54j4d-3isk3-js4sp-vqct5-rae"); description = ""; },
      { token_id = 90_478_665_615_071_160_744_864_710_225_799_387_668_426_035_757_448_060_111_658_411_790_698_032_413_685; owner = Principal.fromText("n3br6-rkkdh-5jcq7-pbwsx-yeqm7-jbzqi-54j4d-3isk3-js4sp-vqct5-rae"); description = ""; },
      { token_id = 43_390_120_835_540_896_790_511_226_478_578_189_836_662_865_491_871_069_517_338_044_934_339_994_592_358; owner = Principal.fromText("zdcg2-dqaaa-aaaap-qpnha-cai"); description = ""; },
      { token_id = 68_215_284_938_893_074_988_662_466_156_818_448_886_241_594_207_684_971_486_265_150_964_575_210_509_710; owner = Principal.fromText("bpugj-ozcgk-vojtz-6ox7w-zc5s4-ylxg3-rvtm6-eowkm-weqlk-yhblr-jqe"); description = ""; },
    ];

    let initial_nfts = Array.map<NFTData, ICRC7.SetNFTItemRequest>(
      nft_data,
      func (data: NFTData) : ICRC7.SetNFTItemRequest {
        {
          base_nft with
          token_id = data.token_id;
          owner = ?{owner = data.owner; subaccount = null;};
          metadata = #Map([("description", #Text(data.description))]);
        }
      }
    );

    let set_nft_request : ICRC7.SetNFTRequest = initial_nfts;

    switch(icrc7.set_nfts<system>(caller, set_nft_request, true)){
      case(#ok(val)) D.print("Successfully initialized NFTs: " # debug_show(val));
      case(#err(err)) D.trap("Failed to initialize NFTs: " # err);
    };
  };
}

