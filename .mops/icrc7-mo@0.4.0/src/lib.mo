import MigrationTypes "./migrations/types";
import Migration "./migrations";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import D "mo:base/Debug";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Vec "mo:vector";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import RepIndy "mo:rep-indy-hash";

import CandyConversion "mo:candy_0_3_0/conversion";
import CandyProperties "mo:candy_0_3_0/properties";
import CandyWorkspace "mo:candy_0_3_0/workspace";
import ServiceLib "service";

module {

  /// A debug channel to toggle logging for various aspects of NFT operations.
  ///
  /// Each field corresponds to an operation such as transfer or indexing, allowing
  /// developers to enable or disable logging during development.
  let debug_channel = {
    announce = true;
    get_token_owner = true;
    set_nft = false;
    update_nft = false;
    indexing = false;
    transfer = false;

  };

  public let Map = MigrationTypes.Current.Map;
  public let Set = MigrationTypes.Current.Set;
  public let Vec = MigrationTypes.Current.Vec;
  public let CandyTypes = MigrationTypes.Current.CandyTypes;
  public let ahash = MigrationTypes.Current.ahash;
  public let account_eq = MigrationTypes.Current.account_eq;
  public let account_hash32 = MigrationTypes.Current.account_hash32;
  public let account_compare = MigrationTypes.Current.account_compare;
  public let validAccount = MigrationTypes.Current.validAccount;
  public let default_max_update_batch_size = MigrationTypes.Current.default_max_update_batch_size;
  public let default_max_query_batch_size = MigrationTypes.Current.default_max_query_batch_size;
  public type CurrentState = MigrationTypes.Current.State;
  public type State = MigrationTypes.State;
  public type Stats = MigrationTypes.Current.Stats;
  public type InitArgs = MigrationTypes.Args;
  public type Error = MigrationTypes.Current.Error;
  public type Account = MigrationTypes.Current.Account;
  public type LedgerInfo = MigrationTypes.Current.LedgerInfo;
  public type NFT = MigrationTypes.Current.NFT;
  public type NFTShared = MigrationTypes.Current.NFTShared;
  public type NFTMap = MigrationTypes.Current.NFTMap;
  public type NFTInput = MigrationTypes.Current.NFTInput;
  public type Value = MigrationTypes.Current.Value;
  public type Indexes = MigrationTypes.Current.Indexes;
  public type Environment = MigrationTypes.Current.Environment;
  public type UpdateLedgerInfoRequest = MigrationTypes.Current.UpdateLedgerInfoRequest;
  public type SetNFTRequest = MigrationTypes.Current.SetNFTRequest;
  public type SetNFTItemRequest = MigrationTypes.Current.SetNFTItemRequest;
  public type SetNFTResult = MigrationTypes.Current.SetNFTResult;
  public type MintNotification = MigrationTypes.Current.MintNotification;
  public type UpdateNotification = MigrationTypes.Current.UpdateNotification;

  public type BurnNFTRequest = MigrationTypes.Current.BurnNFTRequest;
  public type BurnNFTItemResponse = MigrationTypes.Current.BurnNFTItemResponse;
  public type BurnNFTBatchResponse = MigrationTypes.Current.BurnNFTBatchResponse;
  public type BurnNFTResult = MigrationTypes.Current.BurnNFTResult;
  public type BurnNotification = MigrationTypes.Current.BurnNotification;

  public type UpdateNFTRequest = MigrationTypes.Current.UpdateNFTRequest;
  public type UpdateNFTResult = MigrationTypes.Current.UpdateNFTResult;

  public type SupportedStandards = MigrationTypes.Current.SupportedStandards;
  public type TokenTransferredListener = MigrationTypes.Current.TokenTransferredListener;
  public type TokenMintListener = MigrationTypes.Current.TokenMintListener;
  public type TokenUpdateListener = MigrationTypes.Current.TokenUpdateListener;
  public type TokenBurnListener = MigrationTypes.Current.TokenBurnListener;

  public type TransferArg = MigrationTypes.Current.TransferArg;
  public type TransferError = MigrationTypes.Current.TransferError;
  public type TransferNotification = MigrationTypes.Current.TransferNotification;
  public type TransferResult = MigrationTypes.Current.TransferResult;

  /// Represents the state of the NFT collection at initialization.
  ///
  /// Returns:
  ///     State - The initial state of the NFT collection.
  public func initialState() : State { #v0_0_0(#data) };

  /// Contains the current state version of the NFT collection.
  public let currentStateVersion = #v0_1_0(#id);

  /// Initializes the state of the NFT collection, migrating from a previous version if necessary.
  public let init = Migration.migrate;

  public let Service = ServiceLib;

  /// The `ICRC7` class encapsulates methods and state necessary to manage a collection
  /// of NFTs (non-fungible tokens), supporting operations like query, transfer, and
  /// updating of NFT data according to the ICRC-7 standard.
  ///
  /// Constructor parameters:
  ///
  ///      `stored: ?State` - The initial state stored for the NFT collection or null.
  ///      `canister: Principal` - The Principal identifier of the canister managing the NFT collection.
  ///      `environment: Environment` - The environment context for the ledger.
  public class ICRC7(stored : ?State, canister : Principal, environment : Environment) {

    var state : CurrentState = switch (stored) {
      case (null) {
        let #v0_1_0(#data(foundState)) = init(initialState(), currentStateVersion, null, canister);
        foundState;
      };
      case (?val) {
        let #v0_1_0(#data(foundState)) = init(val, currentStateVersion, null, canister);
        foundState;
      };
    };

    private let token_transferred_listeners = Vec.new<(Text, TokenTransferredListener)>();
    private let token_mint_listeners = Vec.new<(Text, TokenMintListener)>();
    private let token_update_listeners = Vec.new<(Text, TokenUpdateListener)>();
    private let token_burn_listeners = Vec.new<(Text, TokenBurnListener)>();

    public let migrate = Migration.migrate;

    /// Returns the name of the NFT collection (e.g., My Super NFT).
    public func name() : Text {
      switch (get_ledger_info().name) {
        case (?val) val;
        case (null) "";
      };
    };

    /// Returns the token symbol of the NFT collection (e.g., MS).
    public func symbol() : Text {
      switch (get_ledger_info().symbol) {
        case (?val) val;
        case (null) "";
      };
    };

    /// Returns the text description of the collection.
    public func description() : ?Text {
      get_ledger_info().description;
    };

    /// Returns a link to the logo of the collection. It may be a [DataURL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs) that contains the logo image itself.
    public func logo() : ?Text {
      get_ledger_info().logo;
    };

    /// Returns the total number of NFTs on all accounts.
    public func total_supply() : Nat {
      get_stats().nft_count;
    };

    /// Returns the maximum number of NFTs possible for this collection. Any attempt to mint more NFTs than this supply cap shall be rejected.
    public func supply_cap() : ?Nat {
      return get_ledger_info().supply_cap;
    };

    /// Returns the maximum batch size for batch query calls this ledger implementation supports.
    public func max_query_batch_size() : ?Nat {
      ?get_ledger_info().max_query_batch_size;
    };

    /// Returns the maximum number of token ids allowed for being used as input in a batch update method.
    public func max_update_batch_size() : ?Nat {
      ?get_ledger_info().max_update_batch_size;
    };

    /// Returns the default parameter the ledger uses for take in case the parameter is null in paginated queries.
    public func default_take_value() : ?Nat {
      ?get_ledger_info().default_take_value;
    };

    /// Returns the maximum take value for paginated query calls this ledger implementation supports. The value applies to all paginated calls the ledger exposes.
    public func max_take_value() : ?Nat {
      ?get_ledger_info().max_take_value;
    };

    /// Returns the maximum size of memos as supported by an implementation.
    public func max_memo_size() : ?Nat {
      ?get_ledger_info().max_memo_size;
    };

    /// Returns the atomic batch transfer flag.
    public func atomic_batch_transfers() : ?Bool {
      ?false;
    };

    /// Returns the transaction window.
    public func tx_window() : ?Nat {
      ?get_ledger_info().tx_window;
    };

    /// Returns the transaction window.
    public func permitted_drift() : ?Nat {
      ?get_ledger_info().permitted_drift;
    };

    public func supported_blocktypes() : [(Text,Text)] {
      return[
        ("7mint","https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-7/ICRC-7.md"),
        ("7burn","https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-7/ICRC-7.md"),
        ("7update_token","https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-7/ICRC-7.md"),
        ("7xfer","https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-7/ICRC-7.md")
        ];
    };

    /// Returns all the collection-level metadata of the NFT collection in a single query.
    public func collection_metadata() : Service.CollectionMetadataResponse {
      let results = Vec.new<(Text, Value)>();

      Vec.add(results, ("icrc7:symbol", #Text(symbol())));

      Vec.add(results, ("icrc7:name", #Text(name())));

      switch (description()) {
        case (?val) Vec.add(results, ("icrc7:description", #Text(val)));
        case (null) {};
      };

      switch (logo()) {
        case (?val) Vec.add(results, ("icrc7:logo", #Text(val)));
        case (null) {};
      };

      Vec.add(results, ("icrc7:total_supply", #Nat(total_supply())));

      switch (supply_cap()) {
        case (?val) Vec.add(results, ("icrc7:supply_cap", #Nat(val)));
        case (null) {};
      };

      switch (max_query_batch_size()) {
        case (?val) Vec.add(results, ("icrc7:max_query_batch_size", #Nat(val)));
        case (null) {};
      };

      switch (max_update_batch_size()) {
        case (?val) Vec.add(results, ("icrc7:max_update_batch_size", #Nat(val)));
        case (null) {};
      };

      switch (default_take_value()) {
        case (?val) Vec.add(results, ("icrc7:default_take_value", #Nat(val)));
        case (null) {};
      };

      switch (max_take_value()) {
        case (?val) Vec.add(results, ("icrc7:max_take_value", #Nat(val)));
        case (null) {};
      };

      switch (max_memo_size()) {
        case (?val) Vec.add(results, ("icrc7:max_memo_size", #Nat(val)));
        case (null) {};
      };

      Vec.toArray(results);
    };

    /// Returns the token metadata for token_ids, a list of token ids. Each tuple in the response vector comprises a token id as first element and the metadata corresponding to this token expressed as an optional record comprising text and Value pairs expressing the token metadata as second element. In case a token does not exist, its associated metadata vector is null. If a token does not have metadata, its associated metadata vector is the empty vector.
    ///
    /// WARNING: This method will trap if the argument exceeds `max_query_batch_size`.
    /// Use `get_token_infos_shared` if you want control over this behavior instead.
    public func token_metadata(token_ids : [Nat]) : Service.TokenMetadataResponse {
      switch (get_token_infos_shared(token_ids)) {
        case (#ok(val)) Array.map<(Nat, Service.TokenMetadataItem), Service.TokenMetadataItem>(val, func(x): Service.TokenMetadataItem {x.1});
        case (#err(err)) D.trap(err);
      };
    };

    /// Returns the owner Account of each token in a list token_ids of token ids. The response elements are sorted following an ordering depending on the ledger implementation.
    ///
    /// WARNING: This method will trap if the argument exceeds `max_query_batch_size`.
    /// Use `get_token_owners` if you want control over this behavior instead.
    public func owner_of(token_ids : Service.OwnerOfRequest) : Service.OwnerOfResponse {
      switch (get_token_owners(token_ids)) {
        case (#ok(val)) val;
        case (#err(err)) D.trap(err);
      };
    };

    /// Returns the balance of the account provided as an argument, i.e., the number of tokens held by the account. For a non-existing account, the value 0 is returned.
    public func balance_of(accounts : Service.BalanceOfRequest) : Service.BalanceOfResponse {
      
      let results = Vec.new<Nat>();

      for(thisItem in accounts.vals()){
        if(not validAccount(thisItem)) D.trap("invalid account " # debug_show(thisItem));
        Vec.add(results, get_token_owners_tokens_count(thisItem));
      };

      return Vec.toArray(results);
    };

    /// Returns the list of tokens in this ledger, sorted by their token id.
    public func tokens(prev : ?Nat, take : ?Nat) : [Nat] {
      get_tokens_paginated(prev, take);
    };

    /// Returns a vector of token_ids of all tokens held by account, sorted by token_id. The token ids in the response are sorted in any consistent sorting order used by the ledger. The result is paginated, the mechanics of pagination are analogous to icrc7_tokens using prev and take to control pagination.
    public func tokens_of(account : Service.Account, prev : ?Nat, take : ?Nat) : [Nat] {
      if(not validAccount(account)) D.trap("invalid account " # debug_show(account));
      get_tokens_of_paginated(account, prev, take);
    };

    /// Transfers one or more tokens from the account defined by the caller principal and subaccount to the to account. The transfer can only be initiated by the holder of the tokens.
    ///
    /// WARNING: This method will trap if the argument exceeds `max_update_batch_size` and for numerous other reasons (see `transfer_tokens` implementation for details).
    /// Use `transfer_tokens` if you want control over this behavior instead.
    public func transfer<system>(caller : Principal, args : [Service.TransferArg]) : [?Service.TransferResult] {
      switch (transfer_tokens<system>(caller, args)) {
        case (#ok(val)) val;
        case (#err(err)) D.trap(err);
      };
    };

    /// Returns the list of standards this ledger implements.
    public func supported_standards() : Service.SupportedStandardsResponse {
      get_state().supported_standards;
    };

    /// Returns the collection level ledger information.
    ///
    /// Returns:
    ///      LedgerInfo - Information about the collection ledger.
    public func get_ledger_info() : LedgerInfo {
      return state.ledger_info;
    };

    /// Returns the state information.
    ///
    /// Returns:
    ///      CurrentState - All the State from the current class.
    public func get_state() : CurrentState {
      return state;
    };

    /// Returns the environment for the current Class.
    ///
    /// Returns:
    ///      Environment - Environment info.
    public func get_environment() : Environment {
      return environment;
    };

    /// Returns the owner of the collection.
    ///
    /// Returns:
    ///      Principal - Entiety that deployed the .
    public func get_collection_owner() : Principal {
      return state.owner;
    };

    /// Returns the indexes calculated on the class.
    ///
    /// Returns:
    ///      Indexes - Information about the collection.
    public func get_indexes() : Indexes {
      return state.indexes;
    };

    /// Retrieves information about a specific token by its ID.
    ///
    /// Parameters:
    ///     token_id: Nat - The ID of the token to query information for.
    ///
    /// Returns:
    ///     ?NFT - An optional NFT struct containing token information if found, or null if the token ID does not exist.
    public func get_nft(token_id : Nat) : ?NFT {
      debug if (debug_channel.announce) D.print("get_token_info" # debug_show (token_id));
      return Map.get(state.nfts, Map.nhash, token_id);
    };

    /// Retrieves metadata for a list of tokens.
    ///
    /// Parameters:
    ///      token_ids : [Nat] - The list of token ids to retrieve metadata for.
    ///
    /// Returns:
    ///      [(Nat, NFT)] - A tuple array with token ids and their corresponding metadata. If a token does not exist, it won't be returned.
    public func get_token_infos(token_ids : [Nat]) : [(Nat, ?NFT)] {
      debug if (debug_channel.announce) D.print("get_token_infos" # debug_show (token_ids));
      
      let result = Array.map<Nat, (Nat, ?NFT)>(token_ids, func(x : Nat) : (Nat, ?NFT) {
          switch (get_nft(x)) {
            case (null) (x, null);
            case (?val) (x, ?val);
          };
        }
      );

      return result;
    };

    /// Retrieves shared metadata for a list of tokens.
    ///
    /// Parameters:
    ///      token_ids : [Nat] - The list of token ids to retrieve shared metadata for.
    ///
    /// Returns:
    ///      Result.Result<[(Nat, NFTMap)], Text> - A result containing a tuple array of token ids and their corresponding NFTMap metadata or an error message if the query size exceeds limits.
    public func get_token_infos_shared(token_ids : Service.TokenMetadataRequest) : Result.Result<[(Nat, Service.TokenMetadataItem)], Text> {
      debug if (debug_channel.announce) D.print("get_token_infos_shared" # debug_show (token_ids));

      if (token_ids.size() > state.ledger_info.max_query_batch_size) return #err("too many tokenids in query. Max is " # Nat.toText(state.ledger_info.max_query_batch_size));

      return #ok(
        Array.map<(Nat, ?NFT), (Nat, Service.TokenMetadataItem)>(
          get_token_infos(token_ids),
          func(x) : (Nat, Service.TokenMetadataItem) {
            switch(x.1) {
              case (null) {
                (x.0, null);
              };
              case (?val) {
                switch (CandyConversion.CandySharedToValue(CandyTypes.shareCandy(val.meta))) {
                  case (#Map(val)) {
                    (x.0, ?val);
                  };
                  case (val) {
                    // if the metadata is set correctly, this case shouldn't occur
                    // TODO: remove this case once we are sure that the metadata is always a map
                    (x.0, ?[("metadata", val)]);
                  };
                };
              };
            };
            
          },
        )
      );
    };

    /// Retrieves the account owner for a specific token.
    ///
    /// Parameters:
    ///      token_id : Nat - The identifier of the token for which to retrieve the owner.
    ///
    /// Returns:
    ///      ?OwnerOfResponse - The token's owner information or null if not found.
    public func get_token_owner(token_id : Nat) : ?Account {
      debug if (debug_channel.announce) D.print("getting owner" # debug_show (token_id));
      switch (Map.get(state.indexes.nft_to_owner, Map.nhash, token_id)) {
        case (null) {
          D.print("not in index");
          return null;
        };
        case (?val) return ?val;
      };
    };

    /// Retrieves the canonical owner of a token
    ///
    /// Parameters:
    ///      token_id : Nat - The identifier of the token for which to retrieve the owner.
    ///
    /// Returns:
    ///      Result.Result<Account, Error> - The account of the owner or an error if not found or malformed.

    public func get_token_owner_canonical(token_id : Nat) : Result.Result<Account, Error> {

      debug if (debug_channel.announce) D.print("get_token_owner_canonical" # debug_show (token_id));

      let ?nft_value = Map.get<Nat, NFT>(state.nfts, Map.nhash, token_id) else return #err({
        error_code = 2;
        message = "token doesn't exist";
      });

      debug if (debug_channel.get_token_owner) D.print("nft value" # debug_show (nft_value));

      switch(nft_value.owner){
        case(null){
          return #ok({
            owner = environment.canister();
            subaccount = null;
          });
        };
        case (?val){
          return #ok(val);
        };
      };
    };

    /// Retrieves the statistical data about the ledger and NFT collection.
    ///
    /// Returns:
    ///      Stats - The statistical data containing ledger and collection details.
    public func get_stats() : Stats {
      return {
        ledger_info = {
          symbol = state.ledger_info.symbol;
          name = state.ledger_info.name;
          description = state.ledger_info.description;
          logo = state.ledger_info.logo;
          supply_cap = state.ledger_info.supply_cap;
          max_query_batch_size = state.ledger_info.max_query_batch_size;
          max_update_batch_size = state.ledger_info.max_update_batch_size;
          default_take_value = state.ledger_info.default_take_value;
          max_take_value = state.ledger_info.max_take_value;
          max_memo_size = state.ledger_info.max_memo_size;
          permitted_drift = state.ledger_info.permitted_drift;
          tx_window = state.ledger_info.tx_window;
          allow_transfers = state.ledger_info.allow_transfers;
          burn_account = state.ledger_info.burn_account;
        };
        nft_count = Map.size(state.nfts);
        //the reason this is not a Map of a Map is so that we can preserve the queness of this Map and retire the oldest approvals if the map gets too large.
        ledger_count = Vec.size(state.ledger);
        owner = state.owner;
        supported_standards = state.supported_standards;
        indexes = {
          nft_to_owner_count = Map.size(state.indexes.owner_to_nfts);
          owner_to_nfts_count = Map.size(state.indexes.owner_to_nfts);

          recent_transactions_count = Map.size(state.indexes.recent_transactions);
        };
      };
    };

    /// Retrieves a list of owners for the specified list of token ids.
    ///
    /// Parameters:
    ///      token_ids : [Nat] - The list of token ids to get owners for.
    ///
    /// Returns:
    ///      Result.Result<OwnerOfResponses, Text> - A result containing a list of owners or an error message if the query size exceeds limits.
    public func get_token_owners(token_ids : [Nat]) : Result.Result<Service.OwnerOfResponse, Text> {

      if (token_ids.size() > state.ledger_info.max_query_batch_size) return #err("too many tokenids in query. Max is " # Nat.toText(state.ledger_info.max_query_batch_size));

      if(uniqueSize(token_ids) != token_ids.size()){
        return #err("duplicates not allowed ");
      };

      #ok(
        Array.map<Nat, ?Account>(
          token_ids,
          get_token_owner
        )
      );
    };

    /// Retrieves the set of tokens owned by an account.
    ///
    /// Parameters:
    ///      account : Account - The owner's account.
    ///
    /// Returns:
    ///      ?Set.Set<Nat> - A set of token ids owned by the account, or null if the account owns no tokens.
    public func get_token_owners_tokens(account : Account) : ?Set.Set<Nat> {
      if(not validAccount(account)) D.trap("invalid account " # debug_show(account));
      debug if (debug_channel.announce) D.print("getting tokens owned by " # debug_show (account));
      return Map.get<Account, Set.Set<Nat>>(state.indexes.owner_to_nfts, ahash, account);
    };

    /// Retrieves the count of tokens owned by an account.
    ///
    /// Parameters:
    ///      account : Account - The owner's account.
    ///
    /// Returns:
    ///      Nat - The number of tokens owned by the account.
    public func get_token_owners_tokens_count(account : Account) : Nat {
      if(not validAccount(account)) D.trap("invalid account " # debug_show(account));
      return switch (get_token_owners_tokens(account)) {
        case (null) 0;
        case (?val) Set.size(val);
      };
    };

    /// Converts metadata to the shared data type.
    ///
    /// Parameters:
    ///      val : CandyTypes.CandyShared - The metadata to convert.
    ///
    /// Returns:
    ///      Value - The shared representation of the metadata.
    public func metadata_to_shared(val : CandyTypes.CandyShared) : Value {
      return CandyConversion.CandySharedToValue(val);
    };

    /// Fetches a paginated list of all tokens in the collection.
    ///
    /// Parameters:
    ///      prev : ?Nat - The previous page's last token id, if paginating.
    ///      take : ?Nat - The number of tokens to take in this batch.
    ///
    /// Returns:
    ///      [Nat] - An array of token ids from the collection.
    public func get_tokens_paginated(prev : ?Nat, take : ?Nat) : [Nat] {

      //this implementation assumes that you have inserted your nft into the NFT collection in
      //ascending order.  Other strategies such as text based keys turned into nats would be
      //advised to keep an ordered index and update it anytime there is a new mint.

      let max_take = state.ledger_info.max_take_value;

      let this_take = switch (take) {
        case (null) { state.ledger_info.default_take_value };
        case (?val) {
          if (val > max_take) {
            max_take;
          } else {
            val;
          };
        };
      };

      let start = switch (prev) {
        case (null) 0;
        case (?val) val;
      };

      let nft_count = Map.size(state.nfts);

      let buf = Vec.new<Nat>();

      debug if (debug_channel.get_token_owner) D.print("about to paginate" # debug_show (nft_count, start, max_take));

      var tracker = 0;
      label search for (thisItem in Map.keys(state.nfts)) {
        if (start > tracker) {
          debug if (debug_channel.get_token_owner) D.print("skipping" # debug_show (tracker));
          tracker += 1;
          continue search;
        };
        debug if (debug_channel.get_token_owner) D.print("adding" # debug_show (tracker, Vec.size(buf)));
        Vec.add(buf, thisItem);
        if (Vec.size(buf) >= this_take) { break search };
        tracker += 1;
      };

      return Vec.toArray(buf);
    };

    /// Fetches a paginated list of tokens owned by an account.
    ///
    /// Parameters:
    ///      account : Account - The owner's account for which to fetch the tokens.
    ///      prev : ?Nat - The previous page's last token id, if paginating.
    ///      take : ?Nat - The number of tokens to take in this batch.
    ///
    /// Returns:
    ///      [Nat] - An array of token ids belonging to the owner.
    public func get_tokens_of_paginated(account : Account, prev : ?Nat, take : ?Nat) : [Nat] {
      if(not validAccount(account)) D.trap("invalid account " # debug_show(account));

      //this implementation assumes may return tokens out of order. The set will be in the order of insertion

      let max_take = state.ledger_info.max_take_value;

      let this_take = switch (take) {
        case (null) { state.ledger_info.default_take_value };
        case (?val) {
          if (val > max_take) {
            max_take;
          } else {
            val;
          };
        };
      };

      let (_bFound, search) = switch (prev) {
        case (null)(true, 0);
        case (?val)(false, val);
      };
      var bFound = _bFound;

      let ?thisSet = Map.get(state.indexes.owner_to_nfts, ahash, account) else return [];

      let buf = Vec.new<Nat>();

      var tracker = 0;

      label search for (thisItem in Set.keys(thisSet)) {
        if (bFound == false) {
          if (search != thisItem) {
            tracker += 1;
            continue search;
          } else {
            bFound := true;
            tracker += 1;
            continue search;
          };
        };
        Vec.add(buf, thisItem);
        if (Vec.size(buf) >= this_take) { break search };
        tracker += 1;
      };

      return Vec.toArray(buf);
    };

    /// Converts an account to its corresponding Value data type.
    ///
    /// Parameters:
    ///      acc : Account - The account to convert.
    ///
    /// Returns:
    ///      Value - The value representation of the account.
    public func accountToValue(acc : Account) : Value {
      let vec = Vec.new<Value>();
      Vec.add(vec, #Blob(Principal.toBlob(acc.owner)));
      switch (acc.subaccount) {
        case (null) {};
        case (?val) {
          Vec.add(vec, #Blob(val));
        };
      };

      return #Array(Vec.toArray(vec));
    };

    /// Validates the provided memo blob field.
    ///
    /// Parameters:
    ///      val : ?Blob - The memo blob to validate.
    ///
    /// Returns:
    ///      ??Blob - The validated memo or null if invalid or null was provided.
    private func testMemo(val : ?Blob) : ??Blob {
      switch (val) {
        case (null) return ?null;
        case (?val) {
          let max_memo = state.ledger_info.max_memo_size;
          if (val.size() > max_memo) {
            return null;
          };
          return ??val;
        };
      };
    };

    /// Validates the provided creation timestamp.
    ///
    /// Parameters:
    ///      val : ?Nat64 - The timestamp to validate.
    ///      environment: Environment - The ledger environment context.
    ///
    /// Returns:
    ///      Result.<?Nat64, Error> - Either the validated timestamp or an error indicating the reason.
    private func testCreatedAt(val : ?Nat64, environment : Environment) : {
      #ok : ?Nat64;
      #Err : { #TooOld; #InTheFuture : Nat64 };

    } {
      switch (val) {
        case (null) return #ok(null);
        case (?val) {
          if (Nat64.toNat(val) > environment.get_time() + state.ledger_info.permitted_drift) {
            return #Err(#InTheFuture(Nat64.fromNat(Int.abs(environment.get_time()))));
          };
          if (Nat64.toNat(val) < environment.get_time() - state.ledger_info.permitted_drift) {
            return #Err(#TooOld);
          };
          return #ok(?val);
        };
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
    public func register_listener<T>(namespace : Text, remote_func : T, listeners : Vec.Vector<Listener<T>>) {
      let listener : Listener<T> = (namespace, remote_func);
      switch (
        Vec.indexOf<Listener<T>>(
          listener,
          listeners,
          func(a : Listener<T>, b : Listener<T>) : Bool {
            Text.equal(a.0, b.0);
          },
        )
      ) {
        case (?index) {
          Vec.put<Listener<T>>(listeners, index, listener);
        };
        case (null) {
          Vec.add<Listener<T>>(listeners, listener);
        };
      };
    };

    /// Registers a listener for when a token is transferred.
    ///
    /// Parameters:
    ///      namespace: Text - The namespace identifying the listener.
    ///      remote_func: TokenTransferredListener - A callback function to be invoked on token transfer.
    public func register_token_transferred_listener(namespace : Text, remote_func : TokenTransferredListener) {
      register_listener<TokenTransferredListener>(namespace, remote_func, token_transferred_listeners);
    };

    /// Registers a listener for when a token is minted.
    ///
    /// Parameters:
    ///      namespace: Text - The namespace identifying the listener.
    ///      remote_func: TokenMintListener - A callback function to be invoked on token mint.
    public func register_token_mint_listener(namespace : Text, remote_func : TokenMintListener) {
      register_listener<TokenMintListener>(namespace, remote_func, token_mint_listeners);
    };

    /// Registers a listener for when a token is updated.
    ///
    /// Parameters:
    ///      namespace: Text - The namespace identifying the listener.
    ///      remote_func: TokenUpdateListener - A callback function to be invoked on token mint.
    public func register_token_update_listener(namespace : Text, remote_func : TokenUpdateListener) {
      register_listener<TokenUpdateListener>(namespace, remote_func, token_update_listeners);
    };

    /// Registers a listener for when a token is burned.
    ///
    /// Parameters:
    ///      namespace: Text - The namespace identifying the listener.
    ///      remote_func: TokenBurnListener - A callback function to be invoked on token burn.
    public func register_token_burn_listener(namespace : Text, remote_func : TokenBurnListener) {
      register_listener<TokenBurnListener>(namespace, remote_func, token_burn_listeners);
    };

    //ledger mangement

    /// Updates the ledger with new information based on the provided requests. This may include changes to
    /// collection name, description, supply details, and other ledger configurations.
    ///
    /// Parameters:
    ///     request: [UpdateLedgerInfoRequest] - A list of requests for updating ledger information.
    ///
    /// Returns:
    ///     [Bool] - A list of boolean values indicating success or failure for each corresponding update request.
    public func update_ledger_info(request : [UpdateLedgerInfoRequest]) : [Bool] {

      let results = Vec.new<Bool>();
      for (thisItem in request.vals()) {
        switch (thisItem) {
          case (#Symbol(val)) { state.ledger_info.symbol := val };
          case (#Name(val)) { state.ledger_info.name := val };
          case (#Description(val)) { state.ledger_info.description := val };
          case (#Logo(val)) { state.ledger_info.logo := val };
          case (#SupplyCap(val)) { state.ledger_info.supply_cap := val };
          case (#MaxQueryBatchSize(val)) {
            state.ledger_info.max_query_batch_size := val;
          };
          case (#MaxUpdateBatchSize(val)) {
            state.ledger_info.max_update_batch_size := val;
          };
          case (#DefaultTakeValue(val)) {
            state.ledger_info.default_take_value := val;
          };
          case (#MaxTakeValue(val)) { state.ledger_info.max_take_value := val };
          case (#MaxMemoSize(val)) { state.ledger_info.max_memo_size := val };
          case (#PermittedDrift(val)) {
            state.ledger_info.permitted_drift := val;
          };
          case (#AllowTransfers(val)) {
            state.ledger_info.allow_transfers := val;
          };
          case (#UpdateOwner(val)) { state.owner := val };
          
          case (#TxWindow(val)) { state.ledger_info.tx_window := val };
          case (#BurnAccount(val)) { state.ledger_info.burn_account := val };
        };
        Vec.add(results, true);
      };
      return Vec.toArray(results);
    };

    //index helper functions

    /// Removes the association between an owner and an NFT.
    /// Parameters:
    ///     token_id: Nat - The token ID to remove ownership of.
    ///     account: Account - The account of the current owner to disassociate from the token.
    ///
    /// Returns:
    ///     Bool - A boolean value indicating if the owner was successfully unindexed from the token.
    private func unindex_owner(token_id : Nat, account : Account) : Bool {

      switch (Map.get(state.indexes.owner_to_nfts, ahash, account)) {
        case (null) { return false };
        case (?val) {
          if (Set.size(val) == 1) {
            ignore Map.remove<Account, Set.Set<Nat>>(state.indexes.owner_to_nfts, ahash, account);
          } else {
            ignore Set.remove<Nat>(val, Map.nhash, token_id);
          };
        };
      };
      return true;
    };

    /// Associates an NFT with a new owner in the indexing structures.
    /// Parameters:
    ///     token_id: Nat - The token ID to associate with the new owner.
    ///     owner: Account - The account of the new owner to index.
    ///
    /// Returns:
    ///     Bool - A boolean value indicating if the owner was successfully indexed with the token.
    private func index_owner(token_id : Nat, owner : Account) : Bool {
      ignore Map.put(state.indexes.nft_to_owner, Map.nhash, token_id, owner);
      let idx = switch (Map.get(state.indexes.owner_to_nfts, ahash, owner)) {
        case (null) {
          let newIndex = Set.new<Nat>();
          ignore Map.put(state.indexes.owner_to_nfts, ahash, owner, newIndex);
          newIndex;
        };
        case (?val) val;
      };
      Set.add(idx, Map.nhash, token_id);

      debug if (debug_channel.indexing) D.print("done indexing");
      return true;
    };

    //Update functions

    public func burn_nfts<system>(caller : Principal, request : BurnNFTRequest) : Result.Result<BurnNFTBatchResponse, Text> {
      //check the top level

      let results = Vec.new<BurnNFTItemResponse>();

      let ?(memo) = testMemo(request.memo) else return #err("invalid memo. must be less than " # debug_show (state.ledger_info.max_memo_size) # " bits");

      switch (testCreatedAt(request.created_at_time, environment)) {
        case (#ok(val)) {};
        case (#Err(#TooOld)) return #ok(#Err(#TooOld));
        case (#Err(#InTheFuture(val))) return #ok(#Err(#CreatedInFuture({ ledger_time = Nat64.fromNat(Int.abs(environment.get_time())) })));
      };

      //do the burn

      label proc for (thisItem in request.tokens.vals()) {

        //does it currently exist?
        let current_owner = switch (Map.get<Nat, NFT>(state.nfts, Map.nhash, thisItem)) {
          case (null) {
            Vec.add(
              results,
              {
                token_id = thisItem;
                result = #Err(#NonExistingTokenId);
              },
            );
            continue proc;
          };
          case (?val) {
            //this nft is being updated and we need to de-index it.
            switch (val.owner) {
              case (null) {
                {
                  owner = environment.canister();
                  subaccount = null;
                };
              };
              case (?val) {
                val;
              };
            };
          };
        };

        if (caller != current_owner.owner) {
          return #ok(#Err(#Unauthorized));
        };

        let trx = Vec.new<(Text, Value)>();
        let trxtop = Vec.new<(Text, Value)>();

        switch (request.memo) {
          case (null) {};
          case (?val) {
            Vec.add(trx, ("memo", #Blob(val)));
          };
        };

        switch (request.created_at_time) {
          case (null) {};
          case (?val) {
            Vec.add(trx, ("ts", #Nat(Nat64.toNat(val))));
          };
        };

        Vec.add(trx, ("tid", #Nat(thisItem)));
        Vec.add(trxtop, ("ts", #Nat(Int.abs(environment.get_time()))));

        Vec.add(trxtop, ("from", accountToValue(current_owner)));
        ignore unindex_owner(thisItem, current_owner);

        let to = switch (state.ledger_info.burn_account) {
          case (null) { null };
          case (?val) {
            Vec.add(trxtop, ("to", accountToValue(val)));
            ?val;
          };
        };

        Vec.add(trx, ("op", #Text("7burn")));

        let txMap = #Map(Vec.toArray(trx));
        let txTopMap = #Map(Vec.toArray(trxtop));
        let preNotification = {
          from = current_owner;
          to = to;
          token_id = thisItem;
          memo = request.memo;
          created_at_time = request.created_at_time;
        };

        let (finaltx, finaltxtop, notification) : (Value, ?Value, BurnNotification) = switch (environment.can_burn) {
          case (null) {
            (txMap, ?txTopMap, preNotification);
          };
          case (?remote_func) {
            switch (remote_func<system>(txMap, ?txTopMap, preNotification)) {
              case (#ok(val)) val;
              case (#err(tx)) {
                Vec.add(
                  results,
                  {
                    token_id = thisItem;
                    result = #Err(#GenericError({ error_code = 3849; message = tx }));
                  },
                );
                continue proc;
              };
            };
          };
        };

        ignore unindex_owner(thisItem, current_owner);

        let transaction_id = switch (environment.add_ledger_transaction) {
          case (null) {
            //use local ledger. This will not scale
            switch (add_local_ledger(finaltxtop, finaltx)) {
              case (#ok(val)) val;
              case (#err(err)) {
                Vec.add(
                  results,
                  {
                    token_id = thisItem;
                    result = #Err(#GenericError({ error_code = 3849; message = err }));
                  },
                );
                continue proc;
              };
            };
          };
          case (?val) val<system>(finaltx, finaltxtop);
        };

        switch (state.ledger_info.burn_account) {
          case (null) {
            //remove it from indexes
            ignore Map.remove<Nat, NFT>(state.nfts, Map.nhash, thisItem);
            ignore Map.remove<Nat, Account>(state.indexes.nft_to_owner, Map.nhash, thisItem);
          };
          case (?val) {
            let ?thisTo = to else D.trap("unreachable state was reached for burn. nullable account is null.");
            switch (update_token_owner(thisItem, ?current_owner, thisTo)) {
              case (#ok(updated_nft)) {};
              case (#err(err)) {
                //if this occures the transaction cannot be recorded and the ledger will be out of sync with ownership,
                //so we must trap the entire state change. But this condition should be unreachable
                D.trap("unreachable state was reached for burn. Could not update owner to the burn account.");
              };
            };
          };
        };

        Vec.add(
          results,
          {
            token_id = thisItem;
            result = #Ok(transaction_id);
          },
        );

        for (thisEvent in Vec.vals(token_burn_listeners)) {
          thisEvent.1<system>(notification, transaction_id);
        };

      };
      return #ok(#Ok(Vec.toArray(results)));
    };

    private func insert_map(top : ?Value, key : Text, val : Value) : Result.Result<Value, Text> {
      let foundTop = switch (top) {
        case (?val) val;
        case (null) #Map([]);
      };
      switch (foundTop) {
        case (#Map(a_map)) {
          let vecMap = Vec.fromArray<(Text, Value)>(a_map);
          Vec.add<(Text, Value)>(vecMap, (key, val));
          return #ok(#Map(Vec.toArray(vecMap)));
        };
        case (_) return #err("bad map");
      };
    };

    public func add_local_ledger(finaltxtop : ?Value, finaltx : Value) : Result.Result<Nat, Text> {
      //use local ledger. This will not scale
      let final = switch (insert_map(finaltxtop, "tx", finaltx)) {
        case (#ok(val)) val;
        case (#err(err)) {
          return #err(err);
        };
      };
      Vec.add<Value>(state.ledger, final);
      return #ok(Vec.size(state.ledger) - 1);
    };

    /// Hard sets (replaces) the metadata for an NFT, potentially creating a new token if it does not already exist.
    /// Parameters:
    ///     request: SetNFTRequest - The request containing NFT data and metadata to set.
    ///
    /// Returns:
    ///     Result.Result<SetNFTBatchResponse, Text> - The outcome of the set operation which could be a batch response
    ///                                                  with results for each NFT or an error message.
    ///
    /// Will produce a 7update transaction on the ledger for updates or 7mint for new tokens
    public func set_nfts<system>(caller : Principal, request : SetNFTRequest, requireOwner: Bool) : Result.Result<[SetNFTResult], Text> {

      //todo: Security at this layer?
      //todo: where to handle minting and setting data

      if (caller != state.owner) { return #err("unauthorized") };

      let results = Vec.new<SetNFTResult>();

      

      label proc for (thisItem in request.vals()) {

        let ?(memo) = testMemo(thisItem.memo) else return #err("invalid memo. must be less than " # debug_show (state.ledger_info.max_memo_size) # " bits");

        if(requireOwner and thisItem.owner == null){
          Vec.add(results, #Err(#GenericError({ error_code = 6443; message = "owner required" })));
          continue proc;
        };

        let created_at_time = switch (testCreatedAt(thisItem.created_at_time, environment)) {
          case (#ok(val)) val;
          case (#Err(#TooOld)) {
            Vec.add(
              results,
              #Err(#TooOld),
            );
            continue proc;
          };
          case (#Err(#InTheFuture(val))){
            Vec.add(
              results,
              #Err(#CreatedInFuture({ ledger_time = Nat64.fromNat(Int.abs(environment.get_time()))})),
            );
            continue proc;
          };
        };

        //does it currently exist?
        let bNew = switch (Map.get<Nat, NFT>(state.nfts, Map.nhash, thisItem.token_id)) {
          case (null) { true };
          case (?val) {
            if (thisItem.override == false) {
              Vec.add(results, #Err(#TokenExists));
              continue proc;
            };
           
            false;
          };
        };

        let bMinting = if(bNew){
          switch(thisItem.owner){
            case(null) false;
            case(?val) true;
          };
        } else false;

        if(bNew == true){
          switch (state.ledger_info.supply_cap) {
            case (?val) {
              if (Map.size(state.nfts) >= val) {
                Vec.add(results, #Err(#GenericError({ error_code = 124; message = "supply cap hit" })));
                continue proc;
              };
            };
            case (null) {};
          };
        };

        let trxid = if(bMinting or (bNew == false and thisItem.override)){
          switch(mint<system>(thisItem, bMinting, bNew)){
            case(#Ok(val)) val;
            case(#Err(err)) {
               Vec.add(results,#Err(err));
              continue proc;
            };
            case(#GenericError(err)){ 
              Vec.add(results,#Err(#GenericError(err)));
              continue proc;
            };
          };
        } else {null};

        

        ignore Map.put<Nat, NFT>(state.nfts, Map.nhash, thisItem.token_id, 
        {
          meta = CandyTypes.unshare(thisItem.metadata);
          var owner = thisItem.owner
        });

        Vec.add(results, #Ok(trxid));

      };
      return #ok(Vec.toArray(results));
    };

    private func mint<system>(thisItem: SetNFTItemRequest, bMinting : Bool, bNew: Bool) : SetNFTResult {
      
          let trx = Vec.new<(Text, Value)>();
          let trxtop = Vec.new<(Text, Value)>();

          switch (thisItem.memo) {
            case (null) {};
            case (?val) {
              Vec.add(trx, ("memo", #Blob(val)));
            };
          };

          switch (thisItem.created_at_time) {
            case (null) {};
            case (?val) {
              Vec.add(trx, ("ts", #Nat(Nat64.toNat(val))));
            };
          };

          Vec.add(trx, ("tid", #Nat(thisItem.token_id)));
          Vec.add(trxtop, ("ts", #Nat(Int.abs(environment.get_time()))));

          if(bMinting){
            Vec.add(trxtop, ("btype", #Text("7mint")));
            Vec.add(trx, ("op", #Text("mint")));
          } else {
            Vec.add(trxtop, ("btype", #Text("7update_token")));
            Vec.add(trx, ("op", #Text("update")));
          };
          
          Vec.add(trx, ("meta", #Map([("icrc7:token_metadata", CandyConversion.CandySharedToValue(thisItem.metadata))])));
  
          let expected_owner = switch (thisItem.owner) {
            case (?val) val;
            case (null) {
              return #GenericError({ error_code = 6453; message = "owner required" });
            }
          };
          

          Vec.add(trx, ("to", accountToValue(expected_owner)));

          let txMap = #Map(Vec.toArray(trx));
          let txTopMap = #Map(Vec.toArray(trxtop));
          let preNotification = {
            token_id = thisItem.token_id;
            memo = thisItem.memo;
            meta = thisItem.metadata;
            from = ?{ owner = state.owner; subaccount = null };
            to = expected_owner;
            created_at_time = thisItem.created_at_time;
            new_token = bNew;
          };

          let (finaltx, finaltxtop, notification) : (Value, ?Value, MintNotification) = switch (environment.can_mint) {
            case (null) {
              (txMap, ?txTopMap, preNotification);
            };
            case (?remote_func) {
              switch (remote_func<system>(txMap, ?txTopMap, preNotification)) {
                case (#ok(val)) val;
                case (#err(tx)) {
                 return #Err(#GenericError({ error_code = 6453; message = tx }));
                };
              };
            };
          };

          let #Map(innerMapArray) = finaltx else {
            return #Err(#GenericError({ error_code = 6453; message = "canMint did not return a tx map" }))
          
          };

          let innerMap = Vec.fromArray<(Text, Value)>(innerMapArray);

          let ?metadataIndex = Vec.firstIndexWith<(Text, Value)>(innerMap, func(x : (Text, Value)) : Bool {
            x.0 == "meta";
          }) else {
          
            return #Err(#GenericError({ error_code = 6453; message = "canMint did not return a meta tag" }));
          };

          //todo: calc size of object
          let updatedMeta = (Vec.get<(Text, Value)>(innerMap, metadataIndex)).1;
          let thisSize = CandyWorkspace.getCandySharedSize(updatedMeta);


          if(thisSize > 1_000_000){
          
            let thisHash = RepIndy.hash_val(CandyConversion.CandySharedToValue(updatedMeta));

            let hash = Blob.fromArray(thisHash);
            Vec.put(innerMap, metadataIndex, ("meta", #Map([("icrc61:metahash", #Blob(hash))])));
          };

          let transaction_id = switch (environment.add_ledger_transaction) {
            case (null) {
              switch (add_local_ledger(finaltxtop, #Map(Vec.toArray(innerMap)))) {
                case (#ok(val)) val;
                case (#err(err)) {
                  
                  return #Err(#GenericError({ error_code = 3849; message = err }));
                };
              };
            };
            case (?val) val<system>(#Map(Vec.toArray(trx)), ? #Map(Vec.toArray(trxtop)));
          };

          if(bNew == false){
            //this nft is being updated and we need to de-index it.
            switch (get_token_owner_canonical(thisItem.token_id)) {
              case (#err(_)) {};
              case (#ok(val)) ignore unindex_owner(thisItem.token_id, val);
            };
          };

          ignore index_owner(thisItem.token_id, expected_owner);

          if(bMinting){
            for (thisEvent in Vec.vals(token_mint_listeners)) {
              thisEvent.1<system>(notification, transaction_id);
            };
          };

          return #Ok(?transaction_id);
    };

    /// Updates the metadata for an NFT incrementally based on the changes specified in the request.
    /// Parameters:
    ///     request: UpdateNFTRequest - The request containing the NFT ID and the updates to be applied to the metadata.
    ///
    /// Returns:
    ///     Result.Result<[UpdateNFTBatchResponse], Text> - The outcome of the update operation which could be a batch response
    ///                                                    with results for each update or an error message.
    ///
    /// Will produce a mint event on the chain. If the item was previously minted this will result in multiple mint records.
    public func update_nfts<system>(caller : Principal, request : UpdateNFTRequest) : Result.Result<[UpdateNFTResult], Text> {

      if (caller != state.owner) { return #err("unauthorized") };

      

      let results = Vec.new<UpdateNFTResult>();
      label proc for (thisItem in request.vals()) {

        let ?(memo) = testMemo(thisItem.memo) else return #err("invalid memo. must be less than " # debug_show (state.ledger_info.max_memo_size) # " bits");

        let created_at_time = switch (testCreatedAt(thisItem.created_at_time, environment)) {
          case (#ok(val)) val;
          case (#Err(#TooOld)) {
            Vec.add(
              results,
              #Err(#TooOld),
            );
            continue proc;
          };
          case (#Err(#InTheFuture(val))){
            Vec.add(results, #Err(#CreatedInFuture({ ledger_time = Nat64.fromNat(Int.abs(environment.get_time()))})));
            continue proc;
          };
        };

        //does it currently exist?
        switch (Map.get<Nat, NFT>(state.nfts, Map.nhash, thisItem.token_id)) {
          case (null) {
            Vec.add(results, #Err(#NonExistingTokenId));
            continue proc;
          };
          case (?val) {
            switch (val.meta) {
              case (#Class(props)) {
                let updatedObject = switch (CandyProperties.updateProperties(props, thisItem.updates)) {
                  case (#ok(val)) val;
                  case (#err(err)) {
                    Vec.add(results, #Err(#GenericError({ error_code = 875; message = debug_show (err) })));
                    continue proc;
                  };
                };

                let newItem : CandyTypes.Candy = #Class(updatedObject);

                let trx = Vec.new<(Text, Value)>();
                let trxtop = Vec.new<(Text, Value)>();

                switch (thisItem.memo) {
                  case (null) {};
                  case (?val) {
                    Vec.add(trx, ("memo", #Blob(val)));
                  };
                };

                switch (thisItem.created_at_time) {
                  case (null) {};
                  case (?val) {
                    Vec.add(trx, ("ts", #Nat(Nat64.toNat(val))));
                  };
                };

                Vec.add(trx, ("tid", #Nat(thisItem.token_id)));
                Vec.add(trxtop, ("ts", #Nat(Int.abs(environment.get_time()))));

                Vec.add(trxtop, ("btype", #Text("7update")));
                Vec.add(trx, ("op", #Text("7update")));

                let itemShared = CandyConversion.CandySharedToValue(CandyTypes.shareCandy(newItem));
                Vec.add(trx, ("meta", #Map([("icrc7:meta",itemShared)])));
                

                let txMap = #Map(Vec.toArray(trx));
                let txTopMap = #Map(Vec.toArray(trxtop));
                let preNotification = {
                  token_id = thisItem.token_id;
                  memo = memo;
                  update = newItem;
                  original = val.meta;
                  from = { owner = caller; subaccount = null };
                  created_at_time = created_at_time;
                  new_token = false;
                };

                let (finaltx, finaltxtop, notification) : (Value, ?Value, UpdateNotification) = switch (environment.can_update) {
                  case (null) {
                    (txMap, ?txTopMap, preNotification);
                  };
                  case (?remote_func) {
                    switch (remote_func<system>(txMap, ?txTopMap, preNotification)) {
                      case (#ok(val)) val;
                      case (#err(tx)) {
                        Vec.add(
                          results, #Err(#GenericError({ error_code = 6453; message = tx })));
                        continue proc;
                      };
                    };
                  };
                };

                let #Map(innerMapArray) = finaltx else {
                  Vec.add(
                    results,#Err(#GenericError({ error_code = 6453; message = "canMint did not return a tx map" }))
                  );
                  continue proc;
                };

                let innerMap = Vec.fromArray<(Text, Value)>(innerMapArray);

                let ?metadataIndex = Vec.firstIndexWith<(Text, Value)>(innerMap, func(x : (Text, Value)) : Bool {
                  x.0 == "meta";
                }) else {Vec.add(
                  results,#Err(#GenericError({ error_code = 6453; message = "canMint did not return a meta tag" })));
                  continue proc; 
                };

                //todo: calc size of object
                let updatedMeta = (Vec.get<(Text, Value)>(innerMap, metadataIndex)).1;
                let thisSize = CandyWorkspace.getCandySharedSize(updatedMeta);

                if(thisSize > 1_000_000){
                
                   let thisHash = RepIndy.hash_val(CandyConversion.CandySharedToValue(updatedMeta));

                  let hash = Blob.fromArray(thisHash);
                  Vec.put(innerMap, metadataIndex, ("meta", #Map([("icrc61:metahash", #Blob(hash))])));
                }else {
                };

                let transaction_id = switch (environment.add_ledger_transaction) {
                  case (null) {

                    switch (add_local_ledger(finaltxtop, finaltx)) {
                      case (#ok(val)) val;
                      case (#err(err)) {
                        Vec.add(results, #Err(#GenericError({ error_code = 3849; message = err })));
                        continue proc;
                      };
                    };
                  };
                  case (?val) val<system>(#Map(Vec.toArray(trx)), ? #Map(Vec.toArray(trxtop)));
                };

                ignore Map.put<Nat, NFT>(state.nfts, Map.nhash, thisItem.token_id, {
                  meta = notification.update;
                  var owner = val.owner
                });

                Vec.add(results, #Ok(transaction_id) );

                

                for (thisEvent in Vec.vals(token_update_listeners)) {
                  thisEvent.1<system>(notification, transaction_id);
                };
              };
              case (_) return #err("Only Class types supported by update");
            };
          };
        };

      };
      return #ok(Vec.toArray(results));
    };

    /// Removes expired recent transactions from the index based on the permitted drift.
    public func cleanUpRecents() : () {
      label clean for (thisItem in Map.entries(state.indexes.recent_transactions)) {
        if (thisItem.1.0 + state.ledger_info.permitted_drift < environment.get_time()) {
          //we can remove this item;
          ignore Map.remove(state.indexes.recent_transactions, Map.bhash, thisItem.0);
        } else {
          //items are inserted in order in this map so as soon as we hit a still valid item, the rest of the list should still be valid as well
          break clean;
        };
      };
    };

    /// Checks if the given array of token IDs contains duplicated values.
    /// Parameters:
    ///     items: [Nat] - The array of token IDs to check for duplicates.
    ///
    /// Returns:
    ///     Bool - A boolean value indicating if duplicates were found or not.
    public func hasDupes(items : [Nat]) : Bool {
      let aSet = Set.fromIter<Nat>(items.vals(), Map.nhash);
      return Set.size(aSet) != items.size();
    };

    /// Removes duplicate token IDs from a list, ensuring each token ID is unique.
    /// Parameters:
    ///     items: [Nat] - The array of token IDs from which to remove duplicates.
    ///
    /// Returns:
    ///     [Nat] - A list of unique token IDs.
    public func uniqueSize(items : [Nat]) : Nat {
      let aSet = Set.fromIter<Nat>(items.vals(), Map.nhash);
      return Set.size(aSet);
    };

    /// Transfers a set of tokens from one owner to another as specified by `transferArgs`.
    ///
    /// Parameters:
    ///      caller: Principal - The Principal identifier of the caller who initiates the transfer.
    ///      transferArgs: TransferArgs - The arguments specifying the details of the transfer.
    ///
    /// Returns:
    ///      Result<Result<TransferResponse, Text>, Text> - The result of the transfer operation, which may contain a success response or an error message.
    public func transfer_tokens<system>(caller : Principal, transferArgs : [TransferArg]) : Result.Result<[?TransferResult], Text> {

      if (state.ledger_info.allow_transfers == false) {
        return #err("transfers not allowed");
      };

      //check that the batch isn't too big
      let safe_batch_size = state.ledger_info.max_update_batch_size;

      if (transferArgs.size() > safe_batch_size) {
        return #err("too many tokens transferred at one time");
      };

      debug if (debug_channel.transfer) D.print("passed checks and calling token transfer");

      let results = Vec.new<?TransferResult>();

      label proc for(thisItem in transferArgs.vals()){

        if(not validAccount(thisItem.to)) return #err("invalid account " # debug_show(thisItem.to));

        if(not validAccount({owner = caller; subaccount = thisItem.from_subaccount})) return #err("invalid account " # debug_show({owner = caller; subaccount = thisItem.from_subaccount}));

        //check to and from account not equal
        if (account_eq(thisItem.to, { owner = caller; subaccount = thisItem.from_subaccount })) {
          Vec.add(
            results,
            ?#Err(#InvalidRecipient),
          );
          continue proc;
        };

        //test that the memo is not too large
        let ?(memo) = testMemo(thisItem.memo) else{
          Vec.add(
            results,
            ?#Err(#GenericBatchError({message="invalid memo. must be less than " # debug_show (state.ledger_info.max_memo_size) # " bits"; error_code=3849}))
          );
          return #ok(Vec.toArray(results));
        };

        //make sure the approval is not too old or too far in the future
        switch (testCreatedAt(thisItem.created_at_time, environment)) {
          case (#ok(val)) {};
          case (#Err(#TooOld)) {
            Vec.add(
              results,
              ?#Err(#TooOld),
            );
            continue proc;
          };
          case (#Err(#InTheFuture(val))){
            Vec.add(
              results,
              ?#Err(#CreatedInFuture({ ledger_time = Nat64.fromNat(Int.abs(environment.get_time())) })),
            );
            continue proc;
          };
        };

        Vec.add(results, transfer_token<system>(caller, thisItem));
      };

      return #ok(
        Vec.toArray(results)
      );
    };

    /// Finds a duplicate transaction based on its hash.
    ///
    /// Parameters:
    ///      trxhash : Blob - The hash of the transaction to search for.
    ///
    /// Returns:
    ///      ?Nat - The identifier of the original transaction if a duplicate is found, otherwise null.
    public func find_dupe(trxhash : Blob) : ?Nat {
      switch (Map.get<Blob, (Int, Nat)>(state.indexes.recent_transactions, Map.bhash, trxhash)) {
        case (?found) {
          if (found.0 + state.ledger_info.permitted_drift + state.ledger_info.tx_window > environment.get_time()) {
            return ?found.1;
          };
        };
        case (null) {};
      };
      return null;
    };

    /// Finalizes the token transfer, updating the ledger and indexes.
    ///
    /// Parameters:
    ///      caller : Principal - The principal of the user initiating the transfer.
    ///      transferArgs : TransferArgs - The transfer arguments containing the token details.
    ///      trx : Vec.Vector<(Text, Value)> - A vector of transaction details.
    ///      trxtop : Vec.Vector<(Text, Value)> - A vector of transaction header details.
    ///      token_id : Nat - The identifier of the token being transferred.
    ///
    /// Returns:
    ///      TransferResponseItem - The result of the transfer operation for the token.
    public func finalize_token_transfer<system>(caller : Principal, transferArg : TransferArg, trx : Vec.Vector<(Text, Value)>, trxtop : Vec.Vector<(Text, Value)>, token_id : Nat) : ?TransferResult {

      //validation required to avoid cycle drain attack
      if(not validAccount(transferArg.to)) D.trap("invalid account " # debug_show(transferArg.to));
      if(not validAccount({owner = caller; subaccount = transferArg.from_subaccount})) D.trap("invalid account " # debug_show({owner = caller; subaccount = transferArg.from_subaccount}));

      //check for duplicate
      let trxhash = Blob.fromArray(RepIndy.hash_val(#Map(Vec.toArray(trx))));

      switch (find_dupe(trxhash)) {
        case (?found) {
          return ?#Err(#Duplicate({ duplicate_of = found }));
        };
        case (null) {};
      };

      debug if (debug_channel.transfer) D.print("about to move the token");

      

      let txMap = #Map(Vec.toArray(trx));
      let txTopMap = #Map(Vec.toArray(trxtop));
      let preNotification = {
        token_id = token_id;
        memo = transferArg.memo;
        from = { 
          owner = caller; 
          subaccount = transferArg.from_subaccount };
        to = transferArg.to;
        created_at_time = transferArg.created_at_time;
      };

      let (finaltx, finaltxtop, notification) : (Value, ?Value, TransferNotification) = switch (environment.can_transfer) {
        case (null) {
          (txMap, ?txTopMap, preNotification);
        };
        case (?remote_func) {
          switch (remote_func<system>(txMap, ?txTopMap, preNotification)) {
            case (#ok(val)) val;
            case (#err(tx)) {
              
              return ?#Err(#GenericError({ error_code = 6453; message = tx }));
              
            };
          };
        };
      };

      let old_owner = { owner = caller; subaccount = transferArg.from_subaccount };
      //move the token
      switch (update_token_owner(token_id, ?old_owner, transferArg.to)) {
        case (#ok(updated_nft)) {};
        case (#err(err)) {
          return ?#Err(#GenericError(err));
        };
      };

      debug if (debug_channel.transfer) D.print("getting trx id");
      //implment ledger;
      let transaction_id : Nat = switch (environment.add_ledger_transaction) {
        case (null) {

          switch (add_local_ledger(finaltxtop, finaltx)) {
            case (#ok(val)) val;
            case (#err(err)) {
              return ?#Err(#GenericError({ error_code = 3849; message = err }));
            };
          };
        };
        case (?val) val<system>(#Map(Vec.toArray(trx)), ? #Map(Vec.toArray(trxtop)));
      };

      ignore Map.put<Blob, (Int, Nat)>(state.indexes.recent_transactions, Map.bhash, trxhash, (environment.get_time(), transaction_id));

      cleanUpRecents();

      for (thisEvent in Vec.vals(token_transferred_listeners)) {
        thisEvent.1<system>(notification, transaction_id);
      };

      return ?#Ok(transaction_id);
    };

    /// Transfers a single token based on the provided transfer arguments.
    ///
    /// Parameters:
    ///      caller : Principal - The principal of the user initiating the transfer.
    ///      token_id : Nat - The identifier of the token being transferred.
    ///      transferArgs : TransferArgs - The transfer arguments containing the token details.
    ///
    /// Returns:
    ///      TransferResponseItem - The result of the transfer operation for the token.
    public func transfer_token<system>(caller : Principal, transferArg : TransferArg) : ?TransferResult {

      if(not validAccount(transferArg.to)) D.trap("invalid account " # debug_show(transferArg.to));
      if(not validAccount({owner = caller; subaccount = transferArg.from_subaccount})) D.trap("invalid account " # debug_show({owner = caller; subaccount = transferArg.from_subaccount}));

      //make sure that either the caller is the owner
      let ?nft = Map.get<Nat, NFT>(state.nfts, Map.nhash, transferArg.token_id) else return ?#Err(#NonExistingTokenId);

      let bMint = if(nft.owner == null){
        let result = switch(mint<system>({
          transferArg with
          owner = ?transferArg.to;
          override = true;
          metadata = CandyTypes.shareCandy(nft.meta);
          token_id = transferArg.token_id;
        }, true, true)){
          case(#Ok(?val)) return ?#Ok(val);
          case(#Ok(null)) return ?#Err(#GenericError({error_code=3849; message="mint failed"}));
          case(#Err(err)){
            switch (err) {
              case (#GenericError(err)) return ?#Err(#GenericError(err));
              case (#CreatedInFuture(err)) return ?#Err(#CreatedInFuture(err));
              case (#NonExistingTokenId) return ?#Err(#NonExistingTokenId);
              case (#TokenExists) return ?#Err(#Unauthorized);
              case (#TooOld) return ?#Err(#TooOld);
              
            };
          }; 
          case(#GenericError(err)) return ?#Err(#GenericError(err));
        };
      } else {
      

        let owner = switch (get_token_owner_canonical(transferArg.token_id)) {
          case (#err(e)) return ?#Err(#GenericError(e));
          case (#ok(val)) val;
        };

        debug if (debug_channel.transfer) D.print("checking owner and caller" # debug_show (owner, caller));

        if (owner.owner != caller) {
          return ?#Err(#Unauthorized);
        }; //only the owner can approve;

        if (owner.subaccount != transferArg.from_subaccount) return ?#Err(#Unauthorized); //from_subaccount must match owner;

        let trx = Vec.new<(Text, Value)>();
        let trxtop = Vec.new<(Text, Value)>();

        switch (transferArg.memo) {
          case (null) {};
          case (?val) {
            Vec.add(trx, ("memo", #Blob(val)));
          };
        };

        switch (transferArg.created_at_time) {
          case (null) {};
          case (?val) {
            Vec.add(trx, ("ts", #Nat(Nat64.toNat(val))));
          };
        };

        Vec.add(trx, ("tid", #Nat(transferArg.token_id)));
        Vec.add(trxtop, ("ts", #Nat(Int.abs(environment.get_time()))));

        Vec.add(trx, ("op", #Text("7xfer")));

        Vec.add(trx, ("from", accountToValue({ owner = caller; subaccount = transferArg.from_subaccount })));
        Vec.add(trx, ("to", accountToValue({ owner = transferArg.to.owner; subaccount = transferArg.to.subaccount })));

        return finalize_token_transfer<system>(caller, transferArg, trx, trxtop, transferArg.token_id);
      };
    };

    /// Updates the owner of a token in the metadata and indexes.
    ///
    /// Parameters:
    ///      token_id : Nat - The identifier of the token for which to update the owner.
    ///      previous_owner : ?Account - The previous owner's account, if there was one.
    ///      target_owner : Account - The new owner's account.
    ///
    /// Returns:
    ///      Result.Result<NFT, Error> - The result of updating the token owner, with the updated NFT or an error.
    public func update_token_owner(token_id : Nat, previous_owner : ?Account, target_owner : Account) : Result.Result<NFT, Error> {

      if(not validAccount(target_owner)) return #err({message="invalid account " # debug_show(target_owner); error_code=394845});

      let ?nft_value = Map.get<Nat, NFT>(state.nfts, Map.nhash, token_id) else return #err({
        error_code = 2;
        message = "token doesn't exist";
      });

      
      nft_value.owner := ?target_owner;

      //update indexes
      ignore index_owner(token_id, target_owner);

      //unindex previous owner

      switch (previous_owner) {
        case (?previous_owner) {
          ignore unindex_owner(token_id, previous_owner);
        };
        case (null) {};
      };

      return #ok(nft_value);
    };

  };

};
