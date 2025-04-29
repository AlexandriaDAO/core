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
      // { token_id = 1_986_593_300_987_535_914_180_049_530_962_874_657_164_380_109_956_141_747_037_709_565_802_331_738_699_840_388_666_345_080_709_091; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      // { token_id = 1_986_593_300_987_535_914_219_784_576_269_852_932_078_473_115_824_316_056_973_383_662_846_012_025_301_278_355_013_091_370_745_492; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
      // { token_id = 1_187_062_600_132_777_102_541_745_778_453_199_791_590_110_030_967_350_889_409_556_289_930_086_013_813_646_597_574_980_649_624_678; owner = Principal.fromText("2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe"); description = ""; },
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
