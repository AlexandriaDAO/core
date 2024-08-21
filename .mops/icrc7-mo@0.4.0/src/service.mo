module {
  public type Map = [(Text, Value)];
  public type Value = {
    #Int : Int;
    #Map : Map;
    #Nat : Nat;
    #Blob : Blob;
    #Text : Text;
    #Array : [Value];
  };
  public type Account = {
    owner : Principal;
    subaccount : ?Blob;
  };
  public type TransferArg = {
    from_subaccount : ?Blob;
    to : Account;
    token_id : Nat;
    // type: leave open for now
    memo : ?Blob;
    created_at_time : ?Nat64;
  };

  public type TransferResult = {
    #Ok :Nat;
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


  public type Metadata = Map;

  public type CollectionMetadataResponse = Metadata;

  public type TokenMetadataResponse = [TokenMetadataItem];

  public type TokenMetadataItem = ?Metadata;
  

  public type OwnerOfResponse = [?Account];

  public type SupportedStandardsResponse = [{ name : Text; url : Text }];

  public type BalanceOfResponse = [Nat];

  public type BalanceOfRequest = [Account];

  public type OwnerOfRequest = [Nat];

  public type TokenMetadataRequest = [Nat];



  public type Service = actor {
    icrc7_name : shared query () -> async Text;
    icrc7_symbol : shared query () -> async Text;
    icrc7_description : shared query () -> async ?Text;
    icrc7_logo : shared query () -> async ?Text;
    icrc7_total_supply : shared query () -> async Nat;
    icrc7_supply_cap : shared query () -> async ?Nat;
    icrc7_max_query_batch_size : shared query () -> async ?Nat;
    icrc7_max_update_batch_size : shared query () -> async ?Nat;
    icrc7_default_take_value : shared query () -> async ?Nat;
    icrc7_max_take_value : shared query () -> async ?Nat;
    icrc7_atomic_batch_transfers : shared query () -> async ?Bool;
    icrc7_max_memo_size : shared query () -> async ?Nat;
    icrc7_tx_window : shared query () -> async ?Nat;
    icrc7_permitted_drift : shared query () -> async ?Nat;
    icrc7_collection_metadata : shared query () -> async CollectionMetadataResponse;
    icrc7_token_metadata : shared query (TokenMetadataRequest) -> async TokenMetadataResponse;
    icrc7_owner_of : shared query (OwnerOfRequest) -> async OwnerOfResponse;
    icrc7_balance_of : shared query (BalanceOfRequest) -> async BalanceOfResponse;
    icrc7_tokens : shared query (prev : ?Nat, take : ?Nat) -> async [Nat];
    icrc7_tokens_of : shared query (Account, prev : ?Nat, take : ?Nat) -> async [Nat];
    icrc7_transfer : shared ([TransferArg]) -> async [?TransferResult];
  };
};
