import MigrationTypes "./migrations/types";
import Migration "./migrations";

import Array "mo:base/Array";
import D "mo:base/Debug";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import RepIndy "mo:rep-indy-hash";

//todo: switch to mops
import ICRC7 "mo:icrc7-mo";
import ServiceLib "service";

module {

  /// A debug channel to toggle logging for various aspects of NFT operations.
  ///
  /// Each field corresponds to an operation such as transfer or indexing, allowing
  /// developers to enable or disable logging during development.
  let debug_channel = {
    announce = true;
    indexing = true;
    transfer = true;
    querying = true;
    approve = true;
    revoke = true;
  };

  /// Access to Map v9.0.1
  public let Map =                  MigrationTypes.Current.Map;

  /// Access to Set v9.0.1
  public let Set =                  MigrationTypes.Current.Set;

  /// Access to Vector
  public let Vec =                  MigrationTypes.Current.Vec;

  

  /// Hashing function for account IDs as defined by the `ICRC7` module. Used for Account based Maps
  public let ahash =                ICRC7.ahash;

  /// Hashing function for approval maps.
  let apphash =                     MigrationTypes.Current.apphash;

  /// Hashing function for Maps of ?Nat
  let nullnathash =                 MigrationTypes.Current.nullnathash;

  /// Account Equality.
  public let account_eq =           ICRC7.account_eq;

  /// Compare functions for sorting accounts.
  let account_compare =             ICRC7.account_compare;

  public type CurrentState =        MigrationTypes.Current.State;
  public type State =               MigrationTypes.State;
  public type Stats =               MigrationTypes.Current.Stats;
  public type InitArgs =            MigrationTypes.Args;
  public type Error =               MigrationTypes.Current.Error;
  public type Account =             MigrationTypes.Current.Account;
  public type LedgerInfo =          MigrationTypes.Current.LedgerInfo;
  public type NFT =                 ICRC7.NFT;
  public type ApprovalInfo =        MigrationTypes.Current.ApprovalInfo;
  public type Value =               MigrationTypes.Current.Value;
  public type Indexes =             MigrationTypes.Current.Indexes;
  public type Environment =         MigrationTypes.Current.Environment;
  public type UpdateLedgerInfoRequest = MigrationTypes.Current.UpdateLedgerInfoRequest;
  
  public type ApproveTokenResult =            MigrationTypes.Current.ApproveTokenResult;
  public type ApproveCollectionResult =       MigrationTypes.Current.ApproveCollectionResult;
  
  public type TransferFromArg =                MigrationTypes.Current.TransferFromArg;
  public type TransferFromResult =            MigrationTypes.Current.TransferFromResult;

  public type TransferFromError =               MigrationTypes.Current.TransferFromError;
  public type TransferNotification =            ICRC7.TransferNotification;
  public type BurnNotification =                ICRC7.BurnNotification;
  
  public type RevokeTokenApprovalArg =            MigrationTypes.Current.RevokeTokenApprovalArg;
  public type RevokeTokenApprovalError =           MigrationTypes.Current.RevokeTokenApprovalError;
  public type RevokeTokenApprovalResult =        MigrationTypes.Current.RevokeTokenApprovalResult;
  public type RevokeCollectionApprovalArg =            MigrationTypes.Current.RevokeCollectionApprovalArg;
  public type RevokeCollectionApprovalError =           MigrationTypes.Current.RevokeCollectionApprovalError;
  public type RevokeCollectionApprovalResult =        MigrationTypes.Current.RevokeCollectionApprovalResult;

  public type TokenApproval =                   MigrationTypes.Current.TokenApproval; 
  public type CollectionApproval =              MigrationTypes.Current.CollectionApproval;

  public type TokenApprovalNotification =              MigrationTypes.Current.TokenApprovalNotification;
  public type CollectionApprovalNotification =              MigrationTypes.Current.CollectionApprovalNotification;
  public type RevokeTokenNotification =              MigrationTypes.Current.RevokeTokenNotification;
  public type RevokeCollectionNotification =              MigrationTypes.Current.RevokeCollectionNotification;
  public type TransferFromNotification =              MigrationTypes.Current.TransferFromNotification;

  public type TokenApprovedListener =              MigrationTypes.Current.TokenApprovedListener;
  public type CollectionApprovedListener =              MigrationTypes.Current.CollectionApprovedListener;
  public type TokenApprovalRevokedListener =              MigrationTypes.Current.TokenApprovalRevokedListener;
  public type CollectionApprovalRevokedListener =              MigrationTypes.Current.CollectionApprovalRevokedListener;
  public type TransferFromListener =              MigrationTypes.Current.TransferFromListener;

  public let Service = ServiceLib;

  let default_take = 10000;

  /// Function to create an initial state for the Approval ICRC37 management.
  public func initialState() : State {#v0_0_0(#data)};

  /// Current ID Version of the Library, used for Migrations
  public let currentStateVersion = #v0_1_0(#id);

  /// Function to initialize a function and migrate it to the current version.
  public let init = Migration.migrate;

  /// Helper function to determine if a Too Old response is present
  public func collectionRevokeIsTooOld(result : RevokeCollectionApprovalResult) : Bool {
    
      switch(result){
        case(#Err(#TooOld)){
          return true;
        };
        case(_){};
      };
   
    return false;
  };

  /// Helper function to determine if a Too Old response is present
  public func tokenRevokeIsTooOld(result : RevokeTokenApprovalResult) : Bool{
    
      switch(result){
        case(#Err(#TooOld)){
          return true;
        };
        case(_){};
      };
    return false;
  };

  /// Helper function to determine if a Too Old response is in the future
  public func collectionRevokeIsInFuture(result : RevokeCollectionApprovalResult) : Bool{
    
      switch(result){
        case(#Err(#CreatedInFuture(err))){
           return true;
        };
        case(_){};
      };
    
    return false;
  };

  /// Helper function to determine if a Too Old response is in the future
  public func tokenRevokeIsInFuture(result : RevokeTokenApprovalResult) : Bool{
    
      switch(result){
        case(#Err(#CreatedInFuture(val))){
          return true;
        };
        case(_){};
      };
    
    return false;
  };


  /// #class ICRC37 
  /// Initializes the state of the ICRC37 class.
  /// - Parameters:
  ///     - stored: `?State` - An optional initial state to start with; if `null`, the initial state is derived from the `initialState` function.
  ///     - canister: `Principal` - The principal of the canister where this class is used.
  ///     - environment: `Environment` - The environment settings for various ICRC standards-related configurations.
  /// - Returns: No explicit return value as this is a class constructor function.
  ///
  /// The `ICRC37` class encapsulates the logic for managing approvals and transfers of NFTs.
  /// Within the class, we have various methods such as `get_ledger_info`, `approve_transfers`, 
  /// `is_approved`, `get_token_approvals`, `revoke_collection_approvals`, and many others
  /// that assist in handling the 7 standard functionalities like getting and setting 
  /// approvals, revoking them, and performing transfers of NFTs.
  ///
  /// The methods often utilize helper functions like `testMemo`, `testExpiresAt`, `testCreatedAt`, 
  /// `revoke_approvals`, `cleanUpApprovals`, `update_ledger_info`, `revoke_collection_approval`, 
  /// `approve_transfer`, `transfer_token`, `revoke_token_approval` and others that perform 
  /// specific operations such as validation of data and performing the necessary changes to the approvals 
  /// and the ledger based on the NFT transactions.
  ///
  /// Event listeners and clean-up routines are also defined to maintain the correct state 
  /// of approvals after transfers and to ensure the system remains within configured limitations.
  ///
  /// The `ICRC37` class allows for detailed ledger updates using `update_ledger_info`, 
  /// querying for different approval states, and managing the transfer of tokens.
  ///    
  /// Additional functions like `get_stats` provide insight into the current state of NFT approvals.
  public class ICRC37(stored: ?State, canister: Principal, environment: Environment){

    var state : CurrentState = switch(stored){
      case(null) {
        let #v0_1_0(#data(foundState)) = init(initialState(),currentStateVersion, null, canister);
        foundState;
      };
      case(?val) {
        let #v0_1_0(#data(foundState)) = init(val,currentStateVersion, null, canister);
        foundState;
      };
    };

    private let token_approved_listeners = Vec.new<(Text, TokenApprovedListener)>();
    private let collection_approved_listeners = Vec.new<(Text, CollectionApprovedListener)>();
     private let token_revoked_listeners = Vec.new<(Text, TokenApprovalRevokedListener)>();
    private let collection_revoked_listeners = Vec.new<(Text, CollectionApprovalRevokedListener)>();
    private let transfer_from_listeners = Vec.new<(Text, TransferFromListener)>();

    public let migrate = Migration.migrate;
    public let TokenErrorToCollectionError = MigrationTypes.Current.TokenErrorToCollectionError;

    // queries

    public func supported_blocktypes() : [(Text,Text)] {
      return[
        ("37approve","https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-37/ICRC-37.md"),
        ("37approve_coll","https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-37/ICRC-37.md"),
        ("37revoke","https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-37/ICRC-37.md"),
        ("37revoke_coll","https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-37/ICRC-37.md"),
        ("37xfer","https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-37/ICRC-37.md"),
        ];
    };

    /// Returns the approval-related metadata of the ledger implementation. The metadata representation is analogous to that of ICRC-7 using the Value type to represent properties.
    public func metadata() : ICRC7.Service.CollectionMetadataResponse {
      let results = Vec.new<(Text, Value)>();

      switch (max_approvals_per_token_or_collection()) {
        case (?val) Vec.add(results, ("icrc37:max_approvals_per_token_or_collection", #Nat(val)));
        case (null) {};
      };

      switch (max_revoke_approvals()) {
        case (?val) Vec.add(results, ("icrc37:max_revoke_approvals", #Nat(val)));
        case (null) {};
      };

      Vec.toArray(results)
    };

    /// Returns the maximum number of approvals this ledger implementation allows to be active per token or per principal for the collection.
    public func max_approvals_per_token_or_collection() : ?Nat {
      return ?get_ledger_info().max_approvals_per_token_or_collection;
    };

    /// Returns the maximum number of approvals this ledger implementation allows to be active per token or per principal for the collection.
    public func max_revoke_approvals() : ?Nat {
      return ?get_ledger_info().max_revoke_approvals;
    };

    /// Returns true if an active approval exists that allows the spender to transfer the token token_id from the given from_subaccount, false otherwise.
    public  func is_approved(requests: [Service.IsApprovedArg]) : [Bool] {
      let results = Vec.new<Bool>();
      label proc for(thisRequest in requests.vals()){
       
      

        debug if(debug_channel.announce) D.print("is_approved " # debug_show(thisRequest));

        //look in collection approvals
        switch(Map.get<(?Nat,Account), ApprovalInfo>(state.token_approvals, apphash, (null, thisRequest.spender))){
          case(null){};
          case(?val){
              if(val.from_subaccount == thisRequest.from_subaccount){ Vec.add(results,true);
              continue proc;
            };
          };
        };
        
        //look in direct approvals
        switch(Map.get<(?Nat,Account), ApprovalInfo>(state.token_approvals, apphash, (?thisRequest.token_id, thisRequest.spender))){
          case(null){};
          case(?val){
            if(val.from_subaccount == thisRequest.from_subaccount) {
              Vec.add(results,true);
              continue proc;
            };
          };
        };
        Vec.add(results,false);
      
      };
      return Vec.toArray(results);
    };

    /// Returns the token-level approvals that exist for the given vector of token_ids. The result is paginated, the mechanics of pagination are analogous to icrc7_tokens using prev and take to control pagination, with prev being of type TokenApproval. Note that take refers to the number of returned elements to be requested. The prev parameter is a TokenApproval element with the meaning that TokenApprovals following the provided one are returned, based on a sorting order over TokenApprovals implemented by the ledger.
    public func get_token_approvals(token_ids : [Nat], prev: ?Service.TokenApproval, take: ?Nat) : [Service.TokenApproval] {
      switch (get_approvals(token_ids, prev, take)) {
        case (#ok(val)) val;
        case (#err(err)) D.trap(err);
      };
    };

    /// Returns the collection-level approvals that exist for the specified owner. The result is paginated, the mechanics of pagination are analogous to icrc7_tokens using prev and take to control pagination. The prev parameter is a CollectionApproval with the meaning that CollectionApprovals following the provided one are returned, based on a sorting order over CollectionApprovals implemented by the ledger.
    public func get_collection_approvals( owner : Service.Account, prev : ?Service.CollectionApproval, take : ?Nat) : [Service.CollectionApproval] {
      switch (collection_approvals(owner, prev, take)) {
        case (#ok(val)) val;
        case (#err(err)) D.trap(err);
      };
    };

    // updates

    /// Transfers one or more tokens from the from account to the to account. The transfer can be initiated by the holder of the tokens (the holder has an implicit approval for acting on all their tokens on their own behalf) or a party that has been authorized by the holder to execute transfers using ICRC37_approve_tokens or ICRC37_approve_collection. The spender_subaccount is used to identify the spender. The spender is an account comprised of the principal calling this method and the parameter spender_subaccount. Omitting the spender_subaccount means using the default subaccount.
    public func transfer_from<system>(caller : Principal, args : [Service.TransferFromArg]) : [?Service.TransferFromResult] {
      switch (transfer<system>(caller, args)) {
        case (#ok(val)) val;
        case (#err(err)) D.trap(err);
      };
    };

    /// Entitles a spender, indicated through an Account, to transfer NFTs on behalf of the caller of this method from account { owner = caller; subaccount = from_subaccount }, where caller is the caller of this method (and also the owner principal of the tokens that are subject to approval) and from_subaccount is the subaccount of the token owner principal the approval should apply to (i.e., the subaccount which the tokens must be held on and can be transferred out from). Note that the from_subaccount parameter needs to be explicitly specified because accounts are a primary concept in this standard and thereby the from_subaccount needs to be specified as part of the account that holds the token. The expires_at value specifies the expiration date of the approval, the memo parameter is an arbitrary blob that is not interpreted by the ledger. The created_at_time field specifies when the approval has been created. The parameter token_ids specifies a batch of tokens to apply the approval to.
    public func approve_tokens<system>(caller : Principal, approval: [Service.ApproveTokenArg]) : [?Service.ApproveTokenResult] {
      switch (approve_transfers<system>(caller, approval)) {
        case (#ok(val)) val;
        case (#err(err)) D.trap(err);
      };
    };

    /// Entitles a spender, indicated through an Account, to transfer any NFT of the collection hosted on this ledger and owned by the caller at the time of transfer on behalf of the caller of this method from account { owner = caller; subaccount = from_subaccount }, where caller is the caller of this method and from_subaccount is the subaccount of the token owner principal the approval should apply to (i.e., the subaccount which tokens the approval should apply to must be held on and can be transferred out from). Note that the from_subaccount parameter needs to be explicitly specified not only because accounts are a primary concept in this standard, but also because the approval applies to the collection, i.e., all tokens on the ledger the caller holds, and those tokens may be held on different subaccounts. The expires_at value specifies the expiration date of the approval, the memo parameter is an arbitrary blob that is not interpreted by the ledger. The created_at_time field specifies when the approval has been created.
    public func approve_collection<system>(caller: Principal, approvals : [Service.ApproveCollectionArg]) : [?Service.ApproveCollectionResult] {

      let results = Vec.new<?ApproveCollectionResult>();

      for(thisApproval in approvals.vals()){
        let thisResult = switch (approve_collection_transfer<system>(caller, thisApproval)) {
          case (#ok(val)) val;
          case (#err(err)) null;
        };

        let translation = switch (thisResult) {
          case (?#Err(val)) {
            ?#Err(TokenErrorToCollectionError(val));
          };
          case (?#Ok(val)) {
            ?#Ok(val);
          };
          case (null) null;
        };
        Vec.add(results,translation);
      };

      return Vec.toArray(results);
    };

    /// Revokes the specified approvals for tokens given by token_ids from the set of active approvals. The from_subaccount parameter specifies the token owner's subaccount to which the approval applies, the spender the party for which the approval is to be revoked. A null value of from_subaccount indicates the default subaccount. A null value for spender means to revoke approvals with any value for the spender.
    public func revoke_token_approvals<system>(caller : Principal, args : [Service.RevokeTokenApprovalArg]) : [?Service.RevokeTokenApprovalResult] {
      switch (revoke_tokens<system>(caller, args)) {
        case (#ok(val)) val;
        case (#err(err)) D.trap(err);
      };
    };

    /// Gets ledger information for the associated ICRC-37 NFT collection.
    /// - Returns: `LedgerInfo` - The current ledger information for the ICRC-37 NFT collection.
    public func get_ledger_info() :  LedgerInfo {
      return state.ledger_info;
    };

    /// Gets indexing information relating to owner approvals.
    /// - Returns: `Indexes` - Indexes relating to the approvals set by various owners against their accounts.
    public func get_indexes() :  Indexes {
      return state.indexes;
    };

    /// Gets state information relating to owner approvals.
    /// - Returns: `State` - Indexes relating to the approvals set by various owners against their accounts.
    public func get_state() :  CurrentState {
      return state;
    };

    /// Approves transfers for specified token IDs.
    /// - Parameters:
    ///     - caller: `Principal` - The principal of the user initiating the approval action.
    ///     - token_ids: `[Nat]` - An array of token IDs the user is granting approval for.
    ///     - approval: `ApprovalInfo` - The approval information including spender and optional expiry.
    /// - Returns: `Result<[ApproveTokenResultItem], Text>` - A result containing either a list of approval response items or an error message in text.
    public func approve_transfers<system>(caller: Principal, approval: [Service.ApproveTokenArg]) : Result.Result<[?ApproveTokenResult], Text> {

      //check that the batch isn't too big
      let safe_batch_size = environment.icrc7.get_ledger_info().max_update_batch_size;

       

      if(approval.size() == 0) return #err("empty token_ids");

      

      let results = Vec.new<?ApproveTokenResult>();
      
      label proc for(thisItem in approval.vals()){ 
        //test that the memo is not too large
        let ?(memo) = testMemo(thisItem.approval_info.memo) else {
          Vec.add(results, ?#Err(#GenericBatchError({message = "invalid memo. must be less than " # debug_show(environment.icrc7.get_ledger_info().max_memo_size) # " bits"; error_code = 111})));
          return #ok(Vec.toArray<?ApproveTokenResult>(results));
        };

        //test that the expires is not in the past
        let ?(expires_at) = testExpiresAt(thisItem.approval_info.expires_at) else {
          Vec.add(results, ?#Err(#GenericError({message = "already expired"; error_code = 1112})));
          continue proc;
        };

        //check from and spender account not equal
        if(account_eq({owner = caller; subaccount = thisItem.approval_info.from_subaccount}, thisItem.approval_info.spender)) {
          Vec.add(results, ?#Err(#GenericError({message = "cannot approve tokens on the same account"; error_code = 1112})));
          continue proc;
        };

        let current_approvals = switch(Map.get(state.indexes.owner_to_approval_account, ahash, {owner = caller; subaccount = thisItem.approval_info.from_subaccount})){
          case(?val){
            Set.size(val);
          };
          case(null) 0;
        };

        debug if(debug_channel.approve) D.print("number of approvals" # debug_show(current_approvals, state.ledger_info.max_approvals_per_token_or_collection));

        if(current_approvals >= state.ledger_info.max_approvals_per_token_or_collection){
          Vec.add(results, ?#Err(#GenericBatchError({message="Too many approvals from account" # debug_show({owner = caller; subaccount = thisItem.approval_info.from_subaccount}); error_code = 1114})));
          return #ok(Vec.toArray<?ApproveTokenResult>(results));
        };

        //make sure the approval is not too old or too far in the future
        let created_at_time = switch(testCreatedAt(thisItem.approval_info.created_at_time, environment)){
          case(#ok(val)) val;
          case(#Err(#TooOld)) {
            Vec.add(results, ?#Err(#TooOld));
            continue proc;
          };
          case(#Err(#InTheFuture(val))){
            Vec.add(results, ?#Err(#CreatedInFuture({ledger_time = Nat64.fromNat(Int.abs(environment.get_time()))})));
            continue proc;
          };
        };

        switch(environment.icrc7.get_nft(thisItem.token_id)){
          case(?val) {};
          case(null){
            Vec.add(results, ?#Err(#NonExistingTokenId));
            continue proc;
          };
        };
        

        let ?owner = environment.icrc7.get_token_owner(thisItem.token_id) else {
          Vec.add(results, ?#Err(#Unauthorized));
          continue proc;
        };

        //check from and spender account not equal
        if(not account_eq(owner,{owner = caller; subaccount= thisItem.approval_info.from_subaccount})) {
          Vec.add(results, ?#Err(#Unauthorized));
          continue proc;
        };


        let result = approve_transfer<system>(environment, caller, ?thisItem.token_id, thisItem.approval_info);
        
        switch(result.0){
          case(null) {// should be unreachable;
            Vec.add(results, ?#Err(#GenericError({error_code = 8; message = "unreachable null token"}))); 
          }; 
          case(?val)Vec.add(results, ?#Ok(val));
        };
      };
      return #ok(Vec.toArray<?ApproveTokenResult>(results));
    };

    private func testMemo(val : ?Blob) : ??Blob{
      switch(val){
        case(null) return ?null;
        case(?val){
          let max_memo = environment.icrc7.get_ledger_info().max_memo_size;
          if(val.size() > max_memo){
            return null;
          };
          return ??val;
        };
      };
    };

    private func testExpiresAt(val : ?Nat64) : ??Nat64{
      switch(val){
        case(null) return ?null;
        case(?val){
          if(Nat64.toNat(val) < environment.get_time()){
            return null;
          };
          return ??val;
        };
      };
    };

    private func testCreatedAt(val : ?Nat64, environment: Environment) : {
      #ok: ?Nat64;
      #Err: {#TooOld;#InTheFuture: Nat64};
      
    }{
      switch(val){
        case(null) return #ok(null);
        case(?val){
          if(Nat64.toNat(val) > environment.get_time() + environment.icrc7.get_ledger_info().permitted_drift){
            return #Err(#InTheFuture(Nat64.fromNat(Int.abs(environment.get_time()))));
          };
          if(Nat64.toNat(val) < environment.get_time() - environment.icrc7.get_ledger_info().permitted_drift){
            return #Err(#TooOld);
          };
          return #ok(?val);
        };
      };
    };



    /// Gets token approvals given specific token IDs and paginates results based on previous approvals and page size.
    /// - Parameters:
    ///     - token_ids: `[Nat]` - An array of token IDs to get approvals for.
    ///     - prev: `?TokenApproval` - An optional approval to use as the starting point for pagination.
    ///     - take: `?Nat` - The number of approvals to be fetched, effectively the page size.
    /// - Returns: `Result<[TokenApproval], Text>` - Either a list of token approvals or an error message.
    public func get_approvals(token_ids: [Nat], prev: ?TokenApproval, take: ?Nat) : Result.Result<[TokenApproval], Text>{

      
      if(token_ids.size() > environment.icrc7.get_ledger_info().max_query_batch_size) return #err("too many tokenids in qurey. Max is " # Nat.toText(environment.icrc7.get_ledger_info().max_query_batch_size));
        
      
      let results = Vec.new<TokenApproval>();

      //sort the tokenIDs
      let sorted_tokens = Array.sort<Nat>(token_ids, Nat.compare);

      var tracker = 0;
      var bFound = switch(prev){
        case(null) true;
        case(?val) false;
      };

      let max_take_value = environment.icrc7.get_ledger_info().max_take_value;
      
      switch(take){
        case(?take){
          if(take > max_take_value) return #err("too many in take. Max is " # Nat.toText(max_take_value));
        };
        case(null){

        };
      };

      let default_take_value = environment.icrc7.get_ledger_info().default_take_value;

      var targetCount = switch(take){
        case(?val) val;
        case(null) default_take_value;
      };

      for(thisToken in sorted_tokens.vals()){
        switch(Map.get<?Nat, Set.Set<Account>>(state.indexes.token_to_approval_account, nullnathash, ?thisToken)){
          case(null){};
          case(?set){
            let sorted = Iter.sort<Account>(Set.keys(set), account_compare);
            for(thisAccount in sorted){

              if(bFound == false){
                switch(prev){
                  case(null){}; //unreachable
                  case(?prev){
                    if((Nat.compare(thisToken, prev.token_id) == #equal or (Nat.compare(thisToken, prev.token_id) == #greater) and account_compare(thisAccount, prev.approval_info.spender) == #greater)){
                      bFound := true;
                    };
                  };
                };
              };
              switch(Map.get<(?Nat, Account), ApprovalInfo>(state.token_approvals, apphash, (?thisToken, thisAccount))){
                case(null){};//unreachable
                case(?foundApproval){
                  if(bFound){
                    Vec.add(results, {
                      token_id = thisToken;
                      approval_info = foundApproval;
                    });
                    if(Vec.size(results) == targetCount){
                      return #ok(Vec.toArray<TokenApproval>(results));
                    };
                  };
                };
              };
            };
          };
        };
      };

      return #ok(Vec.toArray<TokenApproval>(results)); 

    };

    /// Gets collection approvals for the specified owner and paginates results based on previous approvals and page size.
    /// - Parameters:
    ///     - owner: `Account` - The account for which to get collection approvals.
    ///     - prev: `?CollectionApproval` - An optional approval to use as the starting point for pagination.
    ///     - take: `?Nat` - The number of approvals to be fetched, effectively the page size.
    /// - Returns: `Result<[CollectionApproval], Text>` - Either a list of collection approvals or an error message.
    public func collection_approvals(owner: Account, prev: ?CollectionApproval, take: ?Nat) : Result.Result<[CollectionApproval], Text>{
      
      let results = Vec.new<CollectionApproval>();

      let ?approvals = Map.get<Account, Set.Set<(?Nat, Account)>>(state.indexes.owner_to_approval_account, ahash, owner) else return #ok([]);

      var bFound = switch(prev){
        case(null) true;
        case(?val) false;
      };

      let max_take_value = environment.icrc7.get_ledger_info().max_take_value;

      switch(take){
        case(?take){
          if(take > max_take_value) return #err("too many in take. Max is " # Nat.toText(max_take_value));
        };
        case(null){

        };
      };

      let default_take_value = environment.icrc7.get_ledger_info().default_take_value;

      var targetCount = switch(take){
        case(?val) val;
        case(null) default_take_value;
      };

      let sorted_accounts = Iter.sort<(?Nat, Account)>(Set.keys(approvals), func(a : (?Nat, Account), b : (?Nat, Account)){
        return account_compare(a.1, b.1);
      });

      debug if(debug_channel.querying) D.print("paginating collection approvals" # debug_show(targetCount, max_take_value, bFound));

      for(thisItem in sorted_accounts){
        if(thisItem.0 == null){
          if(bFound == false){
            switch(prev){
              case(null){}; //unreachable
              case(?prev){
                if(account_compare(thisItem.1, prev.spender) == #greater){
                  bFound := true;
                };
              };
            };
          };
          if(bFound){
            switch(Map.get<(?Nat, Account), ApprovalInfo>(state.token_approvals, apphash, (null, thisItem.1))){
              case(null) {}; //unreachable
              case(?foundItem){
                Vec.add<CollectionApproval>(results, foundItem);
                if(Vec.size(results) == targetCount){
                  return #ok(Vec.toArray<CollectionApproval>(results));
                };
              };
            };
            
          };
        };
      };

      return #ok(Vec.toArray<CollectionApproval>(results)); 
    };

    /// Cleans up approvals for collections that have exceeded a certain threshold.
    public func cleanUpApprovalsRoutine<system>() : () {
      if(Map.size<(?Nat, Account), ApprovalInfo>(state.token_approvals) > state.ledger_info.max_approvals){
        cleanUpApprovals(state.ledger_info.settle_to_approvals);
      };
    };

    /// Cleans up approvals until the Map is reduced to the size in remaining.
    /// - Parameters:
    ///     - remaining: `Nat` - The number of approvals you want the Map size reduced to
    public func cleanUpApprovals<system>(remaining: Nat) : (){
      //this naievly delete the oldest items until the collection is equal or below the remaining value
      let memo = Text.encodeUtf8("icrc3737_system_clean");
    
      label clean for(thisItem in Map.entries<(?Nat, Account), ApprovalInfo>(state.token_approvals)){

        switch(thisItem.0.0){
          //collection approvals
          case(null){
            let result = revoke_approvals(thisItem.0.0, ?thisItem.0.1, thisItem.1.from_subaccount, null);

            label proc for(thisItem in result.vals()){
              let trx = Vec.new<(Text, Value)>();
              let trxtop = Vec.new<(Text, Value)>();

              Vec.add(trx, ("op", #Text("37revoke_coll")));
              Vec.add(trxtop, ("btype", #Text("37revoke_coll")));
              Vec.add(trxtop, ("ts", #Nat(Int.abs(environment.get_time()))));
              Vec.add(trx, ("from", environment.icrc7.accountToValue({owner = environment.canister(); subaccount = null})));
              Vec.add(trx, ("spender", environment.icrc7.accountToValue(thisItem)));
              Vec.add(trxtop, ("memo", #Blob(memo)));
              

              let txMap = #Map(Vec.toArray(trx));
              let txTopMap = #Map(Vec.toArray(trxtop));
              let preNotification = {
                  spender = ?thisItem;
                  from = {owner = environment.canister(); subaccount = null};
                  created_at_time = ?Nat64.fromNat(Int.abs(environment.get_time()));
                  memo = ?memo;
                };

                
              //implment ledger;
              
              let transaction_id = switch(environment.icrc7.get_environment().add_ledger_transaction){
                case(null){
                  
                  switch(environment.icrc7.add_local_ledger(?txTopMap, txMap)){
                    case(#ok(val)) val;
                    case(#err(err)){
                      continue proc;
                    };
                  };
                };
                case(?val) val<system>(txMap, ?txTopMap);
              };

              for(thisEvent in Vec.vals(collection_revoked_listeners)){
                thisEvent.1(preNotification, transaction_id);
              };
            };
          };
          case(?token_id){
            let #ok(owner) = environment.icrc7.get_token_owner_canonical(token_id) else continue clean;
            let result =  revoke_approvals(thisItem.0.0, ?thisItem.0.1, thisItem.1.from_subaccount, ?owner);
            let memo = Text.encodeUtf8("icrc37_system_clean");
            label proc for(thisItem in result.vals()){
              let trx = Vec.new<(Text, Value)>();
              let trxtop = Vec.new<(Text, Value)>();
              Vec.add(trx, ("op", #Text("37revoke")));
              Vec.add(trxtop, ("btype", #Text("37revoke")));
              Vec.add(trxtop, ("ts", #Nat(Int.abs(environment.get_time()))));
              Vec.add(trx, ("tid", #Nat(token_id)));
              Vec.add(trx, ("from", environment.icrc7.accountToValue({owner = environment.canister(); subaccount = null})));
              Vec.add(trx, ("spender", environment.icrc7.accountToValue(thisItem)));
              Vec.add(trxtop, ("memo", #Blob(memo)));

              let txMap = #Map(Vec.toArray(trx));
              let txTopMap = #Map(Vec.toArray(trxtop));
              let preNotification : RevokeTokenNotification = {
                spender = ?thisItem;
                token_id = token_id;
                from = {owner = environment.canister(); subaccount = null};
                created_at_time = ?Nat64.fromNat(Int.abs(environment.get_time()));
                memo = ?memo;
              };

              //implement ledger;
              let transaction_id = switch(environment.icrc7.get_environment().add_ledger_transaction){
                case(null){
                  //use local ledger. This will not scale
                  switch(environment.icrc7.add_local_ledger(?txTopMap, txMap)){
                    case(#ok(val)) val;
                    case(#err(err)){
                      continue proc;
                    };
                  };
                };
                case(?val) val(txMap, ?txTopMap);
              };

              for(thisEvent in Vec.vals(token_revoked_listeners)){
                thisEvent.1(preNotification, transaction_id);
              };
            };
          };
        };

        if(Map.size(state.token_approvals) <= remaining) break clean;
      };
    
    };

    // events

    type Listener<T> = (Text, T);

    /// Generic function to register a listener.
    ///
    /// Parameters:
    ///     namespace: Text - The namespace identifying the listener.
    ///     remote_func: T - A callback function to be invoked.
    ///     listeners: Vec<Listener<T>> - The list of listeners.
    public func register_listener<T>(namespace: Text, remote_func: T, listeners: Vec.Vector<Listener<T>>) {
      let listener: Listener<T> = (namespace, remote_func);
      switch(Vec.indexOf<Listener<T>>(listener, listeners, func(a: Listener<T>, b: Listener<T>) : Bool {
        Text.equal(a.0, b.0);
      })){
        case(?index){
          Vec.put<Listener<T>>(listeners, index, listener);
        };
        case(null){
          Vec.add<Listener<T>>(listeners, listener);
        };
      };
    };



    /// Registers a listener for when a token is approved.
    ///
    /// Parameters:
    ///      namespace: Text - The namespace identifying the listener.
    ///      remote_func: TokenApprovedListener - A callback function to be invoked on token approval.
    public func register_token_approved_listener(namespace: Text, remote_func : TokenApprovedListener){
      register_listener<TokenApprovedListener>(namespace, remote_func, token_approved_listeners);
    };

    /// Registers a listener for when a collection is approved.
    ///
    /// Parameters:
    ///      namespace: Text - The namespace identifying the listener.
    ///      remote_func: CollectionApprovedListener - A callback function to be invoked on collection approval.
    public func register_collection_approved_listener(namespace: Text, remote_func : CollectionApprovedListener){
      register_listener<CollectionApprovedListener>(namespace, remote_func, collection_approved_listeners);
    };

    /// Registers a listener for when a token approval is revoked.
    ///
    /// Parameters:
    ///      namespace: Text - The namespace identifying the listener.
    ///      remote_func: TokenApprovalRevokedListener - A callback function to be invoked on token approval revokation.
    public func register_token_revoked_listener(namespace: Text, remote_func : TokenApprovalRevokedListener){
      register_listener<TokenApprovalRevokedListener>(namespace, remote_func, token_revoked_listeners);
      
    };

    /// Registers a listener for when a collection is revoked.
    ///
    /// Parameters:
    ///      namespace: Text - The namespace identifying the listener.
    ///      remote_func: CollectionApprovalRevokedListener - A callback function to be invoked on collection approval.
    public func register_collection_revoked_listener(namespace: Text, remote_func : CollectionApprovalRevokedListener){
      register_listener<CollectionApprovalRevokedListener>(namespace, remote_func, collection_revoked_listeners);
    };

    /// Registers a listener for when a transfer from completes. Note. It is likely that a notification will be sent from Transfer as well.
    ///
    /// Parameters:
    ///      namespace: Text - The namespace identifying the listener.
    ///      remote_func: TransferFromListener - A callback function to be invoked on transfer from.
    public func register_transfer_from_listener(namespace: Text, remote_func : TransferFromListener){
      register_listener<TransferFromListener>(namespace, remote_func, transfer_from_listeners);
    };

    

    //ledger mangement

    /// Updates ledger information such as approval limitations with the provided request.
    /// - Parameters:
    ///     - request: `[UpdateLedgerInfoRequest]` - A list of requests containing the updates to be applied to the ledger.
    /// - Returns: `[Bool]` - An array of booleans indicating the success of each update request.
    public func update_ledger_info(request: [UpdateLedgerInfoRequest]) : [Bool]{
      
      //todo: Security at this layer?

      let results = Vec.new<Bool>();
      for(thisItem in request.vals()){
        switch(thisItem){
          
          case(#MaxApprovalsPerTokenOrColletion(val)){state.ledger_info.max_approvals_per_token_or_collection := val};
          case(#MaxRevokeApprovals(val)){state.ledger_info.max_revoke_approvals := val};
          case(#MaxApprovals(val)){state.ledger_info.max_approvals := val};
          case(#SettleToApprovals(val)){state.ledger_info.settle_to_approvals := val};
          case(#CollectionApprovalRequiresToken(val)){state.ledger_info.collection_approval_requires_token := val};
        };
        Vec.add(results, true);
      };
      return Vec.toArray(results);
    };

    //Update functions

    /// Revokes collection approval for the current caller based on provided arguments.
    /// - Parameters:
    ///     - caller: `Principal` - The principal of the user initiating the revoke action.
    ///     - revokeArg: `RevokeCollectionApprovalArg` - The arguments specifying the revoke action details.
    /// - Returns: `[RevokeCollectionApprovalResult]` - A list of response items for each revoke action taken.
    public func revoke_collection_approvals<system>(caller : Principal, revokeArgs : [RevokeCollectionApprovalArg]) : [?RevokeCollectionApprovalResult] {



      let list = Vec.new<?RevokeCollectionApprovalResult>();

      

      label proc for(thisItem in revokeArgs.vals()){

        let ?(memo) = testMemo(thisItem.memo) else {
          Vec.add(list, ?#Err(#GenericBatchError({message="invalid memo. must be less than " # debug_show(environment.icrc7.get_ledger_info().max_memo_size) # " bits"; error_code=45})
          ));
          return Vec.toArray(list);
        };

        let trx = Vec.new<(Text, Value)>();
        let trxtop = Vec.new<(Text, Value)>();
        Vec.add(trx, ("op", #Text("37revoke_coll")));
        Vec.add(trx, ("btype", #Text("37revoke_coll")));
        Vec.add(trxtop, ("ts", #Nat(Int.abs(environment.get_time()))));
        Vec.add(trx, ("from", environment.icrc7.accountToValue({owner = caller; subaccount = thisItem.from_subaccount})));
        switch(thisItem.spender){
          case(null){};
          case(?val){
            Vec.add(trx, ("spender", environment.icrc7.accountToValue(val)));
          };
        };
       
        switch(memo){
          case(null){};
          case(?val){
            Vec.add(trx, ("memo", #Blob(val)));
          };
        };

        switch(thisItem.created_at_time){
          case(null){};
          case(?val){
            Vec.add(trx, ("ts", #Nat(Nat64.toNat(val))));
          };
        };

        let txMap = #Map(Vec.toArray(trx));
        let txTopMap = #Map(Vec.toArray(trxtop));
        let preNotification : RevokeCollectionNotification = {
            spender = thisItem.spender;
            from = {owner = caller; 
            subaccount = thisItem.from_subaccount};
            created_at_time = thisItem.created_at_time;
            memo = thisItem.memo;
          };

        let(finaltx, finaltxtop, notification) : (Value, ?Value, RevokeCollectionNotification) = switch(environment.can_revoke_collection_approval){
          case(null){
            (txMap, ?txTopMap, preNotification);
          };
          case(?remote_func){
            switch(remote_func(txMap, ?txTopMap, preNotification)){
              case(#ok(val)) val;
              case(#err(tx)){
                Vec.add(list, ?#Err(#GenericError({error_code = 394; message = tx})));
                continue proc;
              };
            };
          };
        };

        let result = revoke_approvals(null, notification.spender, notification.from.subaccount, null);

         //implment ledger;
        let transaction_id = switch(environment.icrc7.get_environment().add_ledger_transaction){
          case(null){
            switch(environment.icrc7.add_local_ledger(finaltxtop, finaltx)){
              case(#err(err)){
                 Vec.add(list, ?#Err(#GenericError({error_code = 3849; message = err})));
                continue proc;
              };
              case(#ok(val)) val;
            };
          };
          case(?val) val<system>(finaltx, finaltxtop);
        };

        for(thisEvent in Vec.vals(collection_revoked_listeners)){
          thisEvent.1(notification, transaction_id);
        };

        Vec.add<?RevokeCollectionApprovalResult>(list, ?#Ok(transaction_id));
      };

      return Vec.toArray(list);
    };

    /// Revokes a single token transfer approval
    /// - Parameters:
    ///     - caller: `Principal` - The principal of the user initiating the revoke action.
    ///     - token_id: `?Nat` - An optional token ID. If `null`, all collections associated with the spender are considered.
    ///     - revokeArgs: `RevokeCollectionApprovalArg` - The arguments specifying the revoke action details.
    /// - Returns: `[Account]` - A list of spenders who were affected by the revocation.
    ///
    /// warning: Does not provide top level validation. Use revoke_token_approvals to validadate top level paramaters
    private func revoke_token_approval<system>(caller : Principal, revokeArg : RevokeTokenApprovalArg) : ?RevokeTokenApprovalResult {

      let #ok(owner) = environment.icrc7.get_token_owner_canonical(revokeArg.token_id) else return ?#Err(#Unauthorized);

      if(not account_eq( {owner = caller; subaccount = revokeArg.from_subaccount}, owner)) return ?#Err(#Unauthorized); //can only revoke your own tokens;

      let ?(memo) = testMemo(revokeArg.memo) else return ?#Err(#GenericError({
        error_code = 56;
        message = "illegal memo"
      }));

        let list = Vec.new<?RevokeTokenApprovalResult>();

  
        let trx = Vec.new<(Text, Value)>();
        let trxtop = Vec.new<(Text, Value)>();

        Vec.add(trx, ("tid", #Nat(revokeArg.token_id)));
        Vec.add(trx, ("op", #Text("37revoke")));
        Vec.add(trx, ("btype", #Text("37revoke")));
        Vec.add(trxtop, ("ts", #Nat(Int.abs(environment.get_time()))));
        Vec.add(trx, ("from", environment.icrc7.accountToValue({owner = caller; subaccount = revokeArg.from_subaccount})));
        switch(revokeArg.spender){
          case(null){};
          case(?spender){
            Vec.add(trx, ("spender", environment.icrc7.accountToValue(spender)));
          }
        };

        switch(memo){
          case(null){};
          case(?val){
            Vec.add(trx, ("memo", #Blob(val)));
          };
        };

        switch(revokeArg.created_at_time){
          case(null){};
          case(?val){
            Vec.add(trx, ("ts", #Nat(Nat64.toNat(val))));
          };
        };

        let txMap = #Map(Vec.toArray(trx));
        let txTopMap = #Map(Vec.toArray(trxtop));
        let preNotification : RevokeTokenNotification = {
            spender = revokeArg.spender;
            token_id = revokeArg.token_id;
            from = {owner = caller; subaccount = revokeArg.from_subaccount};
            created_at_time = revokeArg.created_at_time;
            memo = revokeArg.memo;
          };

        let(finaltx, finaltxtop, notification) : (Value, ?Value, RevokeTokenNotification) = switch(environment.can_revoke_token_approval){
          case(null){
            (txMap, ?txTopMap, preNotification);
          };
          case(?remote_func){
            switch(remote_func(txMap, ?txTopMap, preNotification)){
              case(#ok(val)) val;
              case(#err(tx)){
                return  ?#Err(#GenericError({error_code = 394; message = tx}));
              };
            };
          };
        };

         //implement ledger;
        let transaction_id = switch(environment.icrc7.get_environment().add_ledger_transaction){
          case(null){
            //use local ledger. This will not scale
            switch(environment.icrc7.add_local_ledger(finaltxtop, finaltx)){
              case(#ok(val)) val;
              case(#err(err)){
                return ?#Err(#GenericError({error_code = 394; message = debug_show(err)}));
              };
            };
          };
          case(?val) val<system>(finaltx, finaltxtop);
        };

        let result = revoke_approvals(?notification.token_id, notification.spender, notification.from.subaccount, ?owner);

        for(thisEvent in Vec.vals(token_revoked_listeners)){
          thisEvent.1(notification, transaction_id);
        };

      return ?#Ok(transaction_id);
    };

    /// Revokes approvals and removes them from records and indexes, for a specified token ID and spender.
    /// - Parameters:
    ///     - token_id: `?Nat` - An optional token ID. If `null`, all collections associated with the spender are considered.
    ///     - spender: `?Account` - An optional spender account. If `null`, all spenders are considered for the specified token.
    ///     - from_subaccount: `?Blob` - An optional subaccount from which revocation is initiated.
    ///     - former_owner: `?Account` - The owner account before revocation.
    /// - Returns: `[Account]` - A list of spenders who were affected by the revocation.
    private func revoke_approvals(token_id: ?Nat, spender: ?Account, from_subaccount: ?Blob, former_owner: ?Account) :  [Account] {

      let spenders = Vec.new<Account>();

      //clean up owner index

      switch(Map.get(state.indexes.token_to_approval_account, nullnathash, token_id)){
        case(?idx){
          switch(spender){
            case(null){
              //remove them all
             
              label proc for(thisItem in Set.keys<Account>(idx)){
                switch(from_subaccount){
                  case(?val){
                    let ?rec = Map.get<(?Nat,Account), ApprovalInfo>(state.token_approvals, apphash, (token_id, thisItem)) else return D.trap("unreachable");
                    if(rec.from_subaccount != from_subaccount) continue proc;
                    ignore Set.remove<Account>(idx, ahash, thisItem);
                  };
                  case(null){};
                };
                Vec.add(spenders, thisItem);

                ignore Map.remove<(?Nat,Account),ApprovalInfo>(state.token_approvals, apphash, (token_id, thisItem));

                switch(former_owner){
                  case(null){};
                  case(?former_owner){
                    switch(Map.get(state.indexes.owner_to_approval_account, ahash, former_owner)){
                      case(null){}; //should be unreachable
                      case(?set){
                        ignore Set.remove<(?Nat, Account)>(set, apphash, (token_id, thisItem));
                        if(Set.size(set) == 0){
                          ignore Map.remove(state.indexes.owner_to_approval_account, ahash, former_owner);
                        };
                      };
                    };
                  };
                };
                //remove the index
              };
              if(from_subaccount == null or Set.size(idx) == 0){
                ignore Map.remove<?Nat, Set.Set<Account>>(state.indexes.token_to_approval_account, nullnathash, token_id);
              };
            };
            case(?val){
              switch(from_subaccount){
                case(?from_subaccount){
                  let ?rec = Map.get<(?Nat,Account), ApprovalInfo>(state.token_approvals, apphash, (token_id, val)) else return [];
                  if(rec.from_subaccount != ?from_subaccount) return [];
                };
                case(null){};
              };
              ignore Map.remove<(?Nat,Account), ApprovalInfo>(state.token_approvals, apphash, (token_id, val));
              ignore Set.remove<Account>(idx, ahash, val);
              if(Set.size(idx) == 0){
                ignore Map.remove(state.indexes.token_to_approval_account, nullnathash, token_id);
              };

              //clean owner to token spender index
              switch(former_owner){
                case(null){};
                case(?former_owner){
                  switch(Map.get(state.indexes.owner_to_approval_account, ahash, former_owner)){
                    case(null){}; //should be unreachable
                    case(?set){
                      ignore Set.remove<(?Nat, Account)>(set, apphash, (token_id, val));
                      if(Set.size(set) == 0){
                        ignore Map.remove(state.indexes.owner_to_approval_account, ahash, former_owner);
                      };
                    };
                  };
                };
              };
              Vec.add(spenders, val);
            }
          };
        };
        case(null){
          return [];
        }
      };

      return Vec.toArray(spenders);
    };

    /// Event callback that is triggered post token transfer, used to revoke any approvals upon ownership change.
    /// - Parameters:
    ///     - token_id: `Nat` - The ID of the token that was transferred.
    ///     - from: `?Account` - The previous owner's account.
    ///     - to: `Account` - The new owner's account.
    ///     - trx_id: `Nat` - The unique identifier for the transfer transaction.
    private func token_transferred<system>(transfer: TransferNotification, trx_id: Nat) : (){
      debug if(debug_channel.announce) D.print("token_transfered was called " # debug_show((transfer.token_id, transfer.from, transfer.to, trx_id)));
      //clear all approvals for this token
      //note: we do not have to log these revokes to the transaction log becasue ICRC37 defines that all approvals are revoked when a token is transfered.
      ignore revoke_approvals(?transfer.token_id, null, null, ?transfer.from);
    };

    /// Event callback that is triggered post token burn, used to revoke any approvals upon ownership change.
    /// - Parameters:
    ///     - token_id: `Nat` - The ID of the token that was transferred.
    ///     - from: `?Account` - The previous owner's account.
    ///     - to: `Account` - The new owner's account.
    ///     - trx_id: `Nat` - The unique identifier for the transfer transaction.
    private func token_burned<system>(burn: BurnNotification, trx_id: Nat) : (){
      debug if(debug_channel.announce) D.print("burntransfered was called " # debug_show((burn.token_id, burn.from, burn.to, trx_id)));
      //clear all approvals for this token
      //note: we do not have to log these revokes to the transaction log becasue ICRC37 defines that all approvals are revoked when a token is transfered.
      ignore revoke_approvals(?burn.token_id, null, null, ?burn.from);
    };

    //registers the private token_transfered event with the ICRC7 component so that approvals can be cleared when a token is transfered.
    environment.icrc7.register_token_transferred_listener("ICRC37", token_transferred);
    environment.icrc7.register_token_burn_listener("ICRC37", token_burned);

    /// Revokes a token transfer approvals
    /// - Parameters:
    ///     - caller: `Principal` - The principal of the user initiating the revoke action.
    ///     - revokeArgs: `RevokeCollectionApprovalArg` - The arguments specifying the revoke action details.
    /// - Returns: Result.Result<[?RevokeTokenApprovalResult], Text>
    public func revoke_tokens<system>(caller : Principal, revokeArgs: [RevokeTokenApprovalArg]) : Result.Result<[?RevokeTokenApprovalResult], Text> {

      //check that the batch isn't too big
        let safe_batch_size = state.ledger_info.max_revoke_approvals;

        if(revokeArgs.size() > safe_batch_size){
          return #ok([?#Err(#GenericBatchError({message = "too many approvals revoked at one time"; error_code = 888;}))]);

        };

        let list = Vec.new<?RevokeTokenApprovalResult>();

        label proc for(x in revokeArgs.vals()) {
            //test that the memo is not too large
          let ?(memo) = testMemo(x.memo) else {
            Vec.add(list, ?#Err(#GenericBatchError({message="invalid memo. must be less than " # debug_show(environment.icrc7.get_ledger_info().max_memo_size) # " bits"; error_code=777})));
             return #ok(Vec.toArray(list));
          };

          //make sure the approval is not too old or too far in the future
          let created_at_time = switch(testCreatedAt(x.created_at_time, environment)){
            case(#ok(val)) val;
            case(#Err(#TooOld)) {
              Vec.add(list,?#Err(#TooOld));
              continue proc;
            };
            case(#Err(#InTheFuture(val))){
              Vec.add(list, ?#Err(#CreatedInFuture({ledger_time = Nat64.fromNat(Int.abs(environment.get_time()))} )));
              continue proc;
            };
          };
  
          debug if(debug_channel.revoke) D.print("revoking approval for token" # Nat.toText(x.token_id));
          let result = revoke_token_approval<system>(caller, x);

          
          Vec.add<?RevokeTokenApprovalResult>(list, result)
          
      };

      #ok(Vec.toArray(list));
    };

    /// Approves a collection by setting a universal spender for all tokens within a collection.
    /// - Parameters:
    ///     - caller: `Principal` - The principal of the user initiating the approval operation.
    ///     - approval: `ApprovalInfo` - Approval settings including spender and optional expiry.
    /// - Returns: `Result<ApproveTokenResult, Text>` - A result that includes approval transaction ID or an error text.
    public func approve_collection_transfer<system>(caller: Principal, approval: Service.ApproveCollectionArg) : Result.Result<?ApproveTokenResult, Text> {

      //test that the memo is not too large
      let ?(memo) = testMemo(approval.approval_info.memo) else return #ok(?#Err(#GenericError({message= "invalid memo. must be less than " # debug_show(environment.icrc7.get_ledger_info().max_memo_size) # " bits"; error_code=48575})));

      //test that the expires is not in the past
      let ?(expires_at) = testExpiresAt(approval.approval_info.expires_at) else return #ok(?#Err(#GenericError({message= "already expired"; error_code=48575})));


      //make sure the approval is not too old or too far in the future
      let created_at_time = switch(testCreatedAt(approval.approval_info.created_at_time, environment)){
        case(#ok(val)) val;
        case(#Err(#TooOld)) return #ok(?#Err(#TooOld));
        case(#Err(#InTheFuture(val))) return  #ok(?#Err(#CreatedInFuture({ledger_time = Nat64.fromNat(Int.abs(environment.get_time()))})));
      };

      //make sure the account doesn't have too many approvals

      let current_approvals = switch(Map.get(state.indexes.owner_to_approval_account, ahash, {owner = caller; subaccount = approval.approval_info.from_subaccount})){
        case(?val){
          Set.size(val);
        };
        case(null) 0;
      };

      debug if(debug_channel.approve) D.print("number of approvals" # debug_show(current_approvals));

      if(current_approvals >= state.ledger_info.max_approvals_per_token_or_collection){
        return  #ok(?#Err(#GenericError({message= "Too many approvals from account" # debug_show({owner = caller; subaccount = approval.approval_info.from_subaccount}); error_code=48575})));
      };

      let result : (?Nat, ApproveTokenResult) = approve_transfer<system>(environment, caller, null, approval.approval_info);

      debug if(debug_channel.approve) D.print("Finished putting approval " # debug_show(result, approval));
      
      switch(result.0, result.1){
        case(?val, _) {// should be unreachable;
          return  #ok(?#Err(#GenericError({message= "unreachable null token" ; error_code=48575})));
        }; 
        case(null, #Ok(val)) return #ok(?#Ok(val));
        case(null, #Err(err)) return #ok(?#Err(err));
      };
    };


    /// approve the transfer of a token by a spender
    private func approve_transfer<system>(environment: Environment, caller: Principal, token_id: ?Nat, approval: ApprovalInfo) : (?Nat, ApproveTokenResult) {
      
      if(approval.spender.owner == caller) return (token_id, #Err(#Unauthorized)); //can't make yourself a spender;

      let trx = Vec.new<(Text, Value)>();
      let trxtop = Vec.new<(Text, Value)>();

      //test that the memo is not too large
      switch(testMemo(approval.memo)){
        case(?null){};
        case(??val){
          Vec.add(trx,("memo", #Blob(val)));
        };
        case(_){}; //unreachable if called from approve_transfers
      };

      //test that the expires is not in the past
      switch(testExpiresAt(approval.expires_at)){
        case(?null){};
        case(??val){
          Vec.add(trx,("exp", #Nat(Nat64.toNat(val))));
        };
        case(_){}; //unreachable if called from approve_transfers
      };

      //test that the expires is not in the past
      switch(approval.created_at_time){
        case(null){};
        case(?val){
          Vec.add(trx,("ts", #Nat(Nat64.toNat(val))));
        };
      };

      //test that this caller owns the token in the specified subaccount;
      switch(token_id){
        case(null){
          //do collection checks
          
          if(state.ledger_info.collection_approval_requires_token == true){
            switch(Map.get<Account, Set.Set<Nat>>(environment.icrc7.get_state().indexes.owner_to_nfts, ahash, {owner = caller; subaccount = approval.from_subaccount})){
              case(null) return (token_id ,#Err(#Unauthorized));//user owns no nfts
              case(_){};
            };
          };
          Vec.add(trx,("op", #Text("37approve_coll")));
          Vec.add(trxtop,("btype", #Text("37approve_coll")));
        };
        case(?token_id){
          
          let ?nft = Map.get<Nat,NFT>(environment.icrc7.get_state().nfts, Map.nhash, token_id) else return (?token_id, #Err(#NonExistingTokenId));

          let owner = switch(environment.icrc7.get_token_owner_canonical(token_id)){
            case(#err(e)) return (?token_id, #Err(#GenericError(e)));
            case(#ok(val)) val;
          };

          if(owner.owner != caller) return (?token_id, #Err(#Unauthorized)); //only the owner can approve;

          if(owner.subaccount != approval.from_subaccount) return (?token_id, #Err(#Unauthorized)); //from_subaccount must match owner;

          Vec.add(trx,("tid", #Nat(token_id)));
          Vec.add(trx,("op", #Text("37approve")));
          Vec.add(trxtop,("btype", #Text("37approve")));
        };
      };

      Vec.add(trxtop,("ts", #Nat(Int.abs(environment.get_time()))));
     
      
      
      Vec.add(trx,("from", environment.icrc7.accountToValue({owner = caller; subaccount = approval.from_subaccount})));

      Vec.add(trx,("spender", environment.icrc7.accountToValue(approval.spender)));

      //check for duplicate
      let trxhash = Blob.fromArray(RepIndy.hash_val(#Map(Vec.toArray(trx))));

      switch(environment.icrc7.find_dupe(trxhash)){
        case(?found){
          return (token_id, #Err(#Duplicate({duplicate_of = found})));
        };
        case(null){};
      };

      let txMap = #Map(Vec.toArray(trx));
      let txTopMap = #Map(Vec.toArray(trxtop));

      let(finaltx, finaltxtop, tokenNotification, collectionNotification) : (Value, ?Value, ?TokenApprovalNotification, ?CollectionApprovalNotification)= switch(token_id){
        case(null){
          let preNotification = {
              spender = approval.spender;
              from = {owner = caller; subaccount = approval.from_subaccount};
              created_at_time = approval.created_at_time;
              memo = approval.memo;
              expires_at = approval.expires_at;
            };

          switch(environment.can_approve_collection){
            case(null){
              (txMap, ?txTopMap, null, ?preNotification);
            };
            case(?remote_func){
              switch(remote_func(txMap, ?txTopMap, preNotification)){
                case(#ok(val)) (val.0, val.1, null, ?val.2);
                case(#err(tx)){
                  return(null, #Err(#GenericError({error_code = 394; message = tx})));
                };
              };
            };
          };
        };
        case(?token_id)
        {
          let preNotification = {
              spender = approval.spender;
              token_id = token_id;
              from = {owner = caller; subaccount = approval.from_subaccount};
              created_at_time = approval.created_at_time;
              memo = approval.memo;
              expires_at = approval.expires_at;
            };

          switch(environment.can_approve_token){
            case(null){
              (txMap, ?txTopMap, ?preNotification, null);
            };
            case(?remote_func){
              switch(remote_func(txMap, ?txTopMap, preNotification)){
                case(#ok(val)) (val.0, val.1, null, ?val.2);
                case(#err(tx)){
                  return(null, #Err(#GenericError({error_code = 394; message = tx})));
                };
              };
            };
          };
        };    
      };

      //todo: implment ledger;
      let transaction_id = switch(environment.icrc7.get_environment().add_ledger_transaction){
        case(null){
            switch(environment.icrc7.add_local_ledger(finaltxtop, finaltx)){
              case(#ok(val)) val;
              case(#err(err)){
                return(token_id,  #Err(#GenericError({error_code = 3849; message = err})));
              };
            };
          };
          case(?val) val<system>(finaltx, finaltxtop);
      };

      //find existing approval
      switch(Map.get<(?Nat,Account),ApprovalInfo>(state.token_approvals, apphash, (token_id,approval.spender))){
        case(null){};
        case(?val){
          //an approval already exists for this token/spender combination
          //we need to remove it and then re-add it to maintin the queueness of the map
          ignore Map.remove<(?Nat,Account),ApprovalInfo>(state.token_approvals, apphash, (token_id,approval.spender));
        };
      };

      debug if(debug_channel.approve) D.print("adding to token approvals " # debug_show(token_id, approval.spender));
      
      ignore Map.put<(?Nat,Account),ApprovalInfo>(state.token_approvals, apphash, (token_id, approval.spender), approval);

      //populate the index
      let existingIndex = switch(Map.get<?Nat, Set.Set<Account>>(state.indexes.token_to_approval_account, nullnathash, token_id)){
        case(null){
          debug if(debug_channel.approve) D.print("adding new index " # debug_show(token_id));
          let newIndex = Set.new<Account>();
          ignore Map.put<?Nat,Set.Set<Account>>(state.indexes.token_to_approval_account, nullnathash, token_id, newIndex);
          newIndex;
        };
        case(?val) val;
      };

      Set.add<Account>(existingIndex, ahash, approval.spender);
      

      //populate the index
      let existingIndex2 = switch(Map.get<Account, Set.Set<(?Nat, Account)>>(state.indexes.owner_to_approval_account, ahash, {owner = caller; subaccount = approval.from_subaccount})){
        case(null){
          debug if(debug_channel.approve) D.print("adding new index " # debug_show({owner = caller; subaccount = approval.from_subaccount}));
          let newIndex = Set.new<(?Nat, Account)>();
          ignore Map.put<Account,Set.Set<(?Nat, Account)>>(state.indexes.owner_to_approval_account, ahash, {owner = caller; subaccount = approval.from_subaccount}, newIndex);
          newIndex;
        };
        case(?val) val;
      };

      Set.add<(?Nat, Account)>(existingIndex2, apphash, (token_id, approval.spender));

      ignore Map.put<Blob, (Int,Nat)>(environment.icrc7.get_state().indexes.recent_transactions, Map.bhash, trxhash, (environment.get_time(), transaction_id));

      switch(token_id){
        case(null){
          let ?thisNotification = collectionNotification;
          for(thisEvent in Vec.vals(collection_approved_listeners)){
            thisEvent.1(thisNotification, transaction_id);
          };
        };
        case(?token_id)
        {
          let ?thisNotification = tokenNotification;
          for(thisEvent in Vec.vals(token_approved_listeners)){
            thisEvent.1(thisNotification, transaction_id);
        };
        }      
      };

      environment.icrc7.cleanUpRecents();
      cleanUpApprovalsRoutine<system>();

      debug if(debug_channel.approve) D.print("Finished putting approval " # debug_show(token_id, approval));

      return(token_id, #Ok(transaction_id));
    };

    /// Detects duplicates in a Nat Array
    private func hasDupes(items : [Nat]) : Bool {
      let aSet = Set.fromIter<Nat>(items.vals(), Map.nhash);
      return Set.size(aSet) != items.size();
    };

    
    private func transfer_token<system>(caller: Principal,  transferFromArgs: TransferFromArg) : Result.Result<TransferFromResult, Text> {

        //make sure that either the caller is the owner or an approved spender
        let ?nft = Map.get<Nat,NFT>(environment.icrc7.get_state().nfts, Map.nhash, transferFromArgs.token_id) else return #ok(#Err(#NonExistingTokenId));

        if(nft.owner == null) return #ok(#Err(#Unauthorized));

        let owner = switch(environment.icrc7.get_token_owner_canonical(transferFromArgs.token_id)){
          case(#err(e)) return #ok(#Err(#GenericError(e)));
          case(#ok(val)) val;
        };

        var spender : ?Account = null;
        let potential_spender = {
            owner = caller;
            subaccount = transferFromArgs.spender_subaccount;
          };

        debug if(debug_channel.approve) D.print("checking owner and caller" # debug_show(owner, caller));

        if(owner.owner == caller){
          return #ok(#Err(#Unauthorized)); //can't spend your own token;
        };

        switch(Map.get<(?Nat,Account),ApprovalInfo>(state.token_approvals, apphash, (null, potential_spender))){
          case(null){};
          case(?val){
            switch(val.expires_at){
              case(?expires_at){
                if(Int.abs(environment.get_time()) < Nat64.toNat(expires_at)){
                  spender := ?potential_spender;
                };
              };
              case(null){
                spender := ?potential_spender;
              };
            };
          };
        };

        if(spender == null){
          switch(Map.get<(?Nat,Account),ApprovalInfo>(state.token_approvals, apphash, (?transferFromArgs.token_id, potential_spender))){
            case(null){};
            case(?val){
              switch(val.expires_at){
                case(?expires_at){
                  if(Int.abs(environment.get_time()) < Nat64.toNat(expires_at)){
                    spender := ?potential_spender;
                  };
                };
                case(null){
                  spender := ?potential_spender;
                };
              };
            };
          };
        };

        debug if(debug_channel.approve) D.print("checking spender" # debug_show(potential_spender, spender));


        if(spender == null){
          return #ok(#Err(#Unauthorized)); //only the spender can spend;
        };
      

        if(owner.subaccount != transferFromArgs.from.subaccount) return #ok(#Err(#Unauthorized)); //from_subaccount must match owner;

        let trx = Vec.new<(Text, Value)>();
        let trxtop = Vec.new<(Text, Value)>();

        switch(transferFromArgs.memo){
          case(null){};
          case(?val){
            Vec.add(trx,("memo", #Blob(val)));
          };
        };

        switch(transferFromArgs.created_at_time){
          case(null){};
          case(?val){
            Vec.add(trx,("ts", #Nat(Nat64.toNat(val))));
          };
        };

        Vec.add(trx,("tid", #Nat(transferFromArgs.token_id)));
        Vec.add(trx,("ts", #Nat(Int.abs(environment.get_time()))));
        Vec.add(trx,("op", #Text("37xfer")));
        Vec.add(trxtop,("btype", #Text("37xfer")));
        
        Vec.add(trx,("from", environment.icrc7.accountToValue({owner = transferFromArgs.from.owner; subaccount = transferFromArgs.from.subaccount})));
        Vec.add(trx,("to", environment.icrc7.accountToValue({owner = transferFromArgs.to.owner; subaccount = transferFromArgs.to.subaccount})));
        switch(spender){
          case(?val){
            Vec.add(trx,("spender", environment.icrc7.accountToValue(val)));
          };
          case(null){};//unreachable
        };

        let txMap = #Map(Vec.toArray(trx));
        let txTopMap = #Map(Vec.toArray(trxtop));
        let preNotification = {
          spender = switch(spender){
            case(?val)val;
            case(null){
              {
                owner = environment.canister(); 
                subaccount = null;
              }
              }; //unreachable;
          };
          token_id = transferFromArgs.token_id;
          from = transferFromArgs.from;
          to = transferFromArgs.to;
          created_at_time = transferFromArgs.created_at_time;
          memo = transferFromArgs.memo;
        };

        let(finaltx, finaltxtop, notification) : (Value, ?Value, TransferFromNotification) = switch(environment.can_transfer_from){
          case(null){
            (txMap, ?txTopMap, preNotification);
          };
          case(?remote_func){
            switch(remote_func(txMap, ?txTopMap, preNotification)){
              case(#ok(val)) val;
              case(#err(tx)){
                
                return #ok(#Err(#GenericError({error_code = 394; message = tx})));
              };
            };
          };
        };

        let ?transaction_result =  environment.icrc7.finalize_token_transfer<system>(caller, {notification with
        from_subaccount = notification.from.subaccount} : ICRC7.TransferArg, trx, trxtop, notification.token_id) else
        return #ok(#Err(#GenericError({error_code = 2345; message = "unreachable null transaction"}))); 

        let trxresult = switch(transaction_result){
          case(#Ok(transaction_id)){
            for(thisEvent in Vec.vals(transfer_from_listeners)){
              thisEvent.1(notification, transaction_id);
            };
            return #ok(#Ok(transaction_id));
          };
          case(#Err(err)){
            return #ok(#Err(err));
          };
        };
    };

    /// Transfers tokens to a new owner as specified in the transferFromArgs.
    /// - Parameters:
    ///     - caller: `Principal` - The principal of the user initiating the transfer.
    ///     - transferFromArgs: `TransferFromArg` - The arguments specifying the transfer details.
    /// - Returns: `Result<TransferFromResult, Text>` - The result of the transfer operation, containing either a successful response or an error text.
    ///
    /// Example:
    /// ```motoko
    /// let transferResult = myICRC37Instance.transfer_from(
    ///   caller,
    ///   {
    ///     from = { owner = ownerPrincipal; subaccount = null };
    ///     to = { owner = recipientPrincipal; subaccount = null };
    ///     token_ids = [789];
    ///     memo = ?Blob.fromArray(Text.toArray("TransferMemo"));
    ///     created_at_time = ?1_615_448_461_000_000_000;
    ///     spender_subaccount = null;
    ///   }
    /// );
    /// ```
    public func transfer<system>(caller: Principal, transferFromArgs: [TransferFromArg]) : Result.Result<[?TransferFromResult], Text> {

      //check that the batch isn't too big
      let safe_batch_size = environment.icrc7.get_ledger_info().max_update_batch_size;

      if(transferFromArgs.size() == 0){
        return #err("no tokens provided");
        //return [(transferFromArgstoken_ids[0], #Err(#GenericError({error_code = 12; message = "too many tokens transfered at one time"})))];
      };


      if(transferFromArgs.size() > safe_batch_size){
        return #ok([?#Err(#GenericBatchError({message = "too many tokens transfered at one time"; error_code= 555}))]);
        //return [(transferFromArgstoken_ids[0], #Err(#GenericError({error_code = 12; message = "too many tokens transfered at one time"})))];
      };

      let results = Vec.new<?TransferFromResult>();

      label proc for(thisItem in transferFromArgs.vals()){
        //check to and from account not equal
        if(account_eq(thisItem.to, thisItem.from)){
          Vec.add(results, ?#Err(#GenericError({message = "cannot transfer tokens to same account"; error_code=444})));
          continue proc;
        };

        //test that the memo is not too large
        let ?(memo) = testMemo(thisItem.memo) else {
          Vec.add(results, ?#Err(#GenericError({message = "invalid memo. must be less than " # debug_show(environment.icrc7.get_ledger_info().max_memo_size) # " bits"; error_code=222})));
          continue proc;
        };

        
        //make sure the approval is not too old or too far in the future
        switch(testCreatedAt(thisItem.created_at_time, environment)){
          case(#ok(val)) {};
          case(#Err(#TooOld)){
            Vec.add(results,?#Err(#TooOld));
            continue proc;
          };
          case(#Err(#InTheFuture(val))) {
            Vec.add(results, ?#Err(#CreatedInFuture({ledger_time = Nat64.fromNat(Int.abs(environment.get_time()))})));
            continue proc;
          };
        };

        debug if(debug_channel.transfer) D.print("calling token transfer" # debug_show(thisItem));
  
        switch(transfer_token<system>(caller, thisItem)){
          case(#ok(result)){
            Vec.add(results, ?result);
          };
          case(#err(err)){
            Vec.add(results, ?#Err(#GenericError({error_code = 394; message = err})));
          };  
        };

        return #ok(Vec.toArray(results));
      };

      return #ok(Vec.toArray(results));
    };

    /// Retrieves statistics related to the ledger and approvals.
    /// - Returns: `Stats` - Statistics reflecting the state of the ledger and the number of approvals set by owners.
    public func get_stats() : Stats{
      return {
        ledger_info = {
          max_approvals_per_token_or_collection  = state.ledger_info.max_approvals_per_token_or_collection;
          max_revoke_approvals    = state.ledger_info.max_revoke_approvals;
        };
        token_approvals_count = Map.size(state.token_approvals);
        indexes = {
          token_to_approval_account_count = Map.size(state.indexes.token_to_approval_account);
          owner_to_approval_account_count = Map.size(state.indexes.owner_to_approval_account);
        };
      };
    };

  };

};