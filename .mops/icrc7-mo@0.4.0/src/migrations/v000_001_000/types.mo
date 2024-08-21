
// please do not import any types from your project outside migrations folder here
// it can lead to bugs when you change those types later, because migration types should not be changed
// you should also avoid importing these types anywhere in your project directly from here
// use MigrationTypes.Current property instead

import MapLib "mo:map9/Map";
import SetLib "mo:map9/Set";
import CandyTypesLib "mo:candy_0_3_0/types";
import Array "mo:base/Array";
import VecLib "mo:vector";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import D "mo:base/Debug";
import Order "mo:base/Order";
import Result "mo:base/Result";
import Text "mo:base/Text";

module {

  public let Map = MapLib;
  public let Set = SetLib;
  public let Vec = VecLib;
  public let CandyTypes = CandyTypesLib;

  /// As described by ICRC3
  public type Value = { 
    #Blob : Blob; 
    #Text : Text; 
    #Nat : Nat;
    #Int : Int;
    #Array : [Value]; 
    #Map : [(Text, Value)]; 
  };

  public type Transaction = Value;

  // Account Types
	public type Subaccount = Blob;

  /// As descrived by ICRC1
  public type Account = {
    owner: Principal;
    subaccount:  ?Subaccount;
  };

  /// default 10000
  public let default_max_update_batch_size = 10000;

  /// default 10000
  public let default_max_query_batch_size = 10000;

  /// default 10000
  public let default_default_take_value = 10000;

  /// default 10000
  public let default_max_take_value = 10000;

  /// default 384
  public let default_max_memo_size = 384;

  /// default 2 Minutes
  public let default_permitted_drift = 120000000000; //1_000_000_000 * 60 * 2; //two Minutes

  /// default transactoin window
  public let default_tx_window = 86400000000000; //one minute * 60*24; //two Minutes

  /// default true
  public let default_allow_transfers = true; 

  //responses

  

  public type TokenID = Nat;

  public type SupportedStandards = [{ name : Text; url : Text }];

  public type LedgerInfo =  {
    var symbol  : ?Text;
    var name    : ?Text;
    var description : ?Text;
    var logo : ?Text;
    var supply_cap: ?Nat;
    var max_query_batch_size : Nat;
    var max_update_batch_size : Nat;
    var default_take_value : Nat;
    var max_take_value: Nat;
    var max_memo_size : Nat;
    var permitted_drift : Nat;
    var tx_window : Nat;
    var allow_transfers : Bool;
    var burn_account : ?Account
  };

  public type LedgerInfoShared =  {
    symbol  : ?Text;
    name    : ?Text;
    description : ?Text;
    logo : ?Text;
    supply_cap: ?Nat;
    max_query_batch_size : Nat;
    max_update_batch_size : Nat;
    default_take_value : Nat;
    max_take_value: Nat;
    max_memo_size : Nat;
    permitted_drift: Nat;
    tx_window: Nat;
    allow_transfers: Bool;
    burn_account: ?Account
  };

  public type NFT = {
    meta: CandyTypes.Candy;
    var owner: ?Account;
  };
  public type NFTInput = CandyTypes.CandyShared;
  public type NFTShared = Value;
  public type NFTMap = [(Text, Value)];

  public type Error = {
    error_code : Nat;
    message : Text;
  };

  public type TransferArg = {
    from_subaccount : ?Blob;
    to : Account;
    token_id : Nat;
    // type: leave open for now
    memo : ?Blob;
    created_at_time : ?Nat64;
  };

  public type TransferNotification = {
    from : Account;
    to : Account;
    token_id : Nat;
    memo : ?Blob;
    created_at_time : ?Nat64;
  };



  public type TransferResult = {
    #Ok : Nat;
    #Err : TransferError;
  };

  public type TransferError = {
    #NonExistingTokenId;
    #TooOld;
    #InvalidRecipient;
    #CreatedInFuture : { ledger_time: Nat64 };
    #Unauthorized;
    #Duplicate : { duplicate_of : Nat };
    #GenericError : { 
      error_code : Nat; 
      message : Text 
    };
    #GenericBatchError : { error_code : Nat; message : Text };
  };

  public type UpdateLedgerInfoRequest = {
    #Symbol: ?Text;
    #Name : ?Text;
    #Description: ?Text;
    #Logo: ?Text;
    #SupplyCap: ?Nat;
    #MaxQueryBatchSize : Nat;
    #MaxUpdateBatchSize : Nat;
    #DefaultTakeValue : Nat;
    #MaxTakeValue : Nat;
    #MaxMemoSize : Nat;
    #PermittedDrift : Nat;
    #TxWindow : Nat;
    #AllowTransfers : Bool;
    #UpdateOwner : Principal;
    #BurnAccount : ?Account
  };

  public type SetNFTRequest =[SetNFTItemRequest];

  public type MintNotification = {
    memo: ?Blob;
    from: ?Account;
    to: Account;
    created_at_time : ?Nat64;
    meta : CandyTypes.CandyShared;
    token_id : Nat;
    new_token : Bool;
  };

  public type UpdateNotification = {
    memo: ?Blob;
    from: Account;
    created_at_time : ?Nat64;
    original : CandyTypes.Candy;
    update :  CandyTypes.Candy;
    token_id : Nat;
    new_token : Bool;
  };

  public type SetNFTItemRequest = {
    token_id: Nat;
    metadata: NFTInput;
    owner: ?Account;
    override: Bool;
    memo: ?Blob;
    created_at_time : ?Nat64;
  };


  public type SetNFTResult =  {
    #Ok: ?Nat;
    #Err: SetNFTError;
    #GenericError : { error_code : Nat; message : Text };
  };

  public type SetNFTError = {
    #NonExistingTokenId;
    #TokenExists;
    #GenericError : { error_code : Nat; message : Text };
    #TooOld;
    #CreatedInFuture : { ledger_time: Nat64 };
  };


  public type BurnNFTRequest = {
    memo: ?Blob;
    created_at_time : ?Nat64;
    tokens : [Nat];
  };

  public type BurnNotification = {
    memo: ?Blob;
    from: Account;
    to: ?Account;
    created_at_time : ?Nat64;
    token_id : Nat;
  };

  public type BurnNFTBatchResponse = {
    #Ok: [BurnNFTItemResponse];
    #Err: BurnNFTBatchError;
  };

  public type BurnNFTItemResponse = {
    token_id: Nat;
    result: BurnNFTResult;
  };

  public type BurnNFTResult =  {
    #Ok: Nat;
    #Err: BurnNFTError;
  };

  public type BurnNFTError = {
    #NonExistingTokenId;
    #InvalidBurn;
    #GenericError : { error_code : Nat; message : Text };
  };

  public type BurnNFTBatchError = {
    #TooOld;
    #CreatedInFuture : { ledger_time: Nat64 };
    #Unauthorized;
    #GenericError : { error_code : Nat; message : Text };
  };

  public type UpdateNFTRequest = [UpdateNFTItemRequest];

  public type UpdateNFTItemRequest = {
    memo: ?Blob;
    created_at_time : ?Nat64;
    token_id: Nat;
    updates: [CandyTypesLib.Update]
  };

  public type UpdateNFTResult =  {
    #Ok: Nat;
    #Err: UpdateNFTError;
  };

  public type UpdateNFTError = {
    #TooOld;
    #CreatedInFuture : { ledger_time: Nat64 };
    #NonExistingTokenId;
    #GenericError : { error_code : Nat; message : Text };
  };

  public func account_hash32(a : Account) : Nat32{
      var accumulator = Map.phash.0(a.owner);
      switch(a.subaccount){
        case(null){
          accumulator +%= Map.bhash.0(nullBlob);
        };
        case(?val){
          accumulator +%= Map.bhash.0(val);
        };
      };
      return accumulator;
    };

  let nullBlob  : Blob = "\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00";

  public func account_eq(a : Account, b : Account) : Bool{
    //D.print("testing account " # debug_show((a,b)));
    if(a.owner != b.owner) return false;
    switch(a.subaccount, b.subaccount){
      case(null, null){};
      case(?vala, ?valb){
        if(vala != valb) return false;
      };
      case(null,?val){
        if(not(nullBlob == val)){
          return false;
        }
      };
      case(?val,null){
        if(not(nullBlob == val)){
          return false;
        }
      };
    };
    return true;
  };

  public func account_compare(a : Account, b : Account) : Order.Order {
    if(a.owner == b.owner){
      switch(a.subaccount, b.subaccount){
        case(null, null) return #equal;
        case(?vala, ?valb) return Blob.compare(vala,valb);
        case(null, ?valb){
          if(valb == nullBlob) return #equal;
         return #less;
        };
        case(?vala, null){
          if(vala == nullBlob) return #equal;
          return #greater;
        }
      };
    } else return Principal.compare(a.owner, b.owner);
  };

  public func validAccount(a : Account) : Bool{
    //D.print("testing account " # debug_show((a,b)));
    switch(a.subaccount){
      case(null){return true};
      case(?vala){
        (vala.size() == 32);
      };
    };
  };

  public let ahash = (account_hash32, account_eq);


  public type Environment = {
    canister : () -> Principal;
    get_time : () -> Int;
    refresh_state: () -> State;
    add_ledger_transaction: ?(<system>(trx: Transaction, trxtop: ?Transaction) -> Nat);
    can_transfer : ?(<system>((trx: Transaction, trxtop: ?Transaction, notification: TransferNotification)) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: TransferNotification), Text>);
    can_mint : ?(<system>(trx: Transaction, trxtop: ?Transaction, notification: MintNotification) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: MintNotification), Text>);
    can_update : ?(<system>(trx: Transaction, trxtop: ?Transaction, notification: UpdateNotification) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: UpdateNotification), Text>);
    can_burn : ?(<system>(trx: Transaction, trxtop: ?Transaction, notification: BurnNotification) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: BurnNotification), Text>);
  };

  public type TokenTransferredListener = <system>(TransferNotification, trxid: Nat) -> ();
  public type TokenBurnListener = <system>(BurnNotification, trxid: Nat) -> ();
  public type TokenMintListener = <system>(MintNotification, trxid: Nat) -> ();
  public type TokenUpdateListener = <system>(UpdateNotification, trxid: Nat) -> ();

  public type Indexes = {
    nft_to_owner : Map.Map<Nat, Account>;
    owner_to_nfts : Map.Map<Account, Set.Set<Nat>>;
    recent_transactions : Map.Map<Blob, (Int,Nat)>;
  };

  public type State = {
    ledger_info : LedgerInfo;
    nfts: Map.Map<Nat, NFT>;
    ledger : Vec.Vector<Value>;
    var owner : Principal;
    var supported_standards : SupportedStandards;
    indexes: Indexes;
  };

  public type Stats = {
    ledger_info : LedgerInfoShared;
    nft_count: Nat;
    ledger_count : Nat;
    owner : Principal;
    supported_standards : SupportedStandards;
    indexes: {
      nft_to_owner_count : Nat;
      owner_to_nfts_count :Nat;
      recent_transactions_count :Nat;
    };
  };
};