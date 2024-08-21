/// A straight line, write only data store designed for icrc3 style ledger archives
/// but useful for other situations.
/// 
/// This library uses the Motoko Stable Region base library under the hood to simplfy
/// the writing of data to a canister that is not expected to change over time.
///
/// Memory is allocated auto allocated as objects are written to the stream.  
/// A max pages(in KiB - 65536 per KiB is provided) and defaults to 62500 worth of pages. (4096000000 bytes)
/// More are suppored. Please see the Region.mo file in motoko-base for compiler level flags
/// that allow for larger regions.
///
/// Installation:
///
/// ```
/// mops add stable-write-only
/// ```
///
/// Usage:
/// ```motoko no-repl
/// import SW "mo:table-write-only";
/// ```
///
/// This Module uses the Class+ pattern discussed at https://forum.dfinity.org/t/writing-motoko-stable-libraries/21201
/// It is stable and does not require memory managment.
///
/// ```
///  stable var memStore = SW.init({
///    maxPages = 64;
///    indexType = #Managed;
///  });
///
///  let mem = SW.StableWriteOnly(?memStore);
/// ```
///
/// Memory is swappable if you end up in a situation where your obects need to be upgraded
///
/// ```
///    let newMem = SW.init({maxPages = 32; indexType=#Managed});
///    let sw = SW.StableWriteOnly(?newMem);
///
///    let replaceItem = {
///      one = 55;
///      two = "test55";
///      three = 55 : Nat64;
///    };
///
///    let result = sw.write(to_candid(replaceItem));
///
///    return oldmem.swap(sw.toSwappable());
///
/// Three different types of memory are offered:
///     #Managed - item info is stored in the managed vector and is streamed in and out of 
///         memory. This means your index will eventually overrun its ability to be upgraded 
///         by the standard motoko upgrade process. (Althoug depending on your other data you 
///         may be able to get up to 100M entries)
///     #Stable and #StableTyped - these keep their indexes in another region of stable memory.
///         stable indexes use two less bytes than stable typed as they are unable to track type info
///
/// For Managed and StableTyped memoreis the library also keeps track of types such that one can tag each write with a
/// type annotation without the library needing to know your types ahead of type. You will need
/// to provide your own type parser.
///
/// ```
///    let x = mem.writeTyped(to_candid(my_testType23_obj), 1)
///    let val = mem.readTyped(x);
///    let ?type_of = val.1;
///
///    if(type_of == 0){
///      return ?#TestType1(
///        switch(from_candid(val.0) : ?TestType1){
///          case(null) return null;
///          case(?val) val;
///        });
///    } else {
///      return ?#TestType3(
///        switch(from_candid(val.0) : ?TestType3){
///          case(null) return null;
///          case(?val) val;
///        });
///    };
/// ```
///
/// The Stable and StableTyped memories are based on Matt Hammer's work at https://github.com/dfinity/motoko/blob/master/doc/md/examples/StableMultiLog.mo


import RegionLib "mo:base/Region";
import D "mo:base/Debug";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Nat16 "mo:base/Nat16";
import Result "mo:base/Result";
import Vec "mo:vector";

module {
  
  /// Holds information about the offset and size and type in the Managed memory;
  public type OffsetInfo = {
    offset: Nat64;
    size: Nat;
    type_of: ?Nat;
  };

  /// The region type that is stable and can be held in stable memory by the application
  public type Region = { 
    var region: RegionLib.Region;
    items : {
      #Managed : Vec.Vector<OffsetInfo>;
      #Stable : {
        var indexRegion : RegionLib.Region;
        var count : Nat64;
        var currentPages : Nat64;
      };
      #StableTyped : {
        var indexRegion : RegionLib.Region;
        var count : Nat64;
        var currentPages: Nat64;
      };
    };
    var maxPages: Nat64;
    var currentPages: Nat64;
    var currentOffset: Nat64;
  };

  /// Used in the initArgs to specify the type of memory to use.
  public type IndexType = {
    #Stable;
    #StableTyped;
    #Managed;
  };

  /// Holds stats about the current state of the memory and stream
  public type Stats = { 
    region: {
      size : Nat64;
      id: Nat;
    };
    itemCount : Nat;
    maxPages: Nat64;
    currentPages: Nat64;
    currentOffset: Nat64;
    memory: {
      type_of: IndexType;
      pages: ?Nat64;
    };
  };

  /// Args for instantiating the object
  public type InitArgs = {
    maxPages: Nat64;
    indexType: IndexType;
  };

  /// Errors that the object can throw on writing
  public type WriteError = {
    #MemoryFull; // the memory is full and cannot grow any more
    #IndexFull; // the index is full and cannot track any more items
    #TypeRequired;  // this kind of write requires a type to be provided
  };

  /// Result type for writing to the memory
  public type WriteResult = Result.Result<Nat, WriteError>;


  let defaultMaxPages = 62500 : Nat64;
  let KiB = 65536 : Nat64;
  let elem_size = 16 : Nat64; /* two Nat64s, for pos and size. */
  let elem_size_typed = 18 : Nat64; /* two Nat64s, for pos and size, one Nat16 to hold up to 2^16 types */

  /// default init function to create a new memory
  /// Specify the max number of pages and the memory type. 
  public func init(args : InitArgs) : Region {
    return {
      var region = RegionLib.new();
      items = switch(args.indexType){
        case(#Managed){
          #Managed(Vec.new<OffsetInfo>());
        };
        case(#Stable){
          #Stable({
            var indexRegion = RegionLib.new();
            var count = 0;
            var currentPages = 0;
          });
        };
        case(#StableTyped){
           #StableTyped({
            var indexRegion = RegionLib.new();
            var count = 0;
            var currentPages = 0;
          });
        };
      };
      var maxPages = args.maxPages;
      var currentPages = 0;
      var currentOffset = 0;
    }: Region;
  };

  /// Class+ access to the stream
  /// Defaults to 62500 max pages and the #Managed memory type
  public class StableWriteOnly(stored: ?Region){

    var store : Region = switch(stored){
      case(null) init({
        maxPages = defaultMaxPages;
        indexType = #Managed
      });
      case(?val) val;
    };

    /// Write a blob to the stream
    public func write(item : Blob) : WriteResult {
      return _writeTyped(item, null);
    };

    // Write a blob to the stream and annotate it with a type
    public func writeTyped(item : Blob, type_of: Nat) : WriteResult {
      return _writeTyped(item, ?type_of);
    };


    private func _writeTyped(item : Blob, type_of: ?Nat) : WriteResult {
      let newItemSize = Nat64.fromNat(item.size());
      let newOffset = store.currentOffset + newItemSize;
      let lastOffset = store.currentOffset;

      //D.print("newItemSize, newOffset, lastOffset, item"  # debug_show(newItemSize, newOffset, lastOffset, item));

      if(newOffset > store.currentPages * 65536){
        //grow the main memory
        
        let neededPages = ((Nat64.sub(newOffset,store.currentOffset)) / KiB) + 1;
        if(neededPages + store.currentPages > store.maxPages) return #err(#MemoryFull);
       
        let beforeSize = RegionLib.grow(store.region, neededPages);
       
        if (beforeSize == 0xFFFF_FFFF_FFFF_FFFF) {
          D.print("memory full " # debug_show(beforeSize) );
          return #err(#MemoryFull);
        };
        store.currentPages += neededPages;
      };

      let thisOffSetInfo = {
        offset = lastOffset;
        size = Nat64.toNat(newItemSize);
      };

      //D.print("setting item offset " # debug_show(thisOffSetInfo, Vec.size(store.items)) );
      let new_index = switch(store.items){
        case(#Managed(items)){
          Vec.add<OffsetInfo>(items, {
            offset = lastOffset;
            size = Nat64.toNat(newItemSize);
            type_of = type_of;
          });

          Nat.sub(Vec.size(items),1);
        };
        case(#Stable(items)){
          let newIndex = (items.count * elem_size) + elem_size;
          if(newIndex > items.currentPages * KiB){
            //grow the index
            let beforeSize = RegionLib.grow(items.indexRegion, 1);
            if (beforeSize == 0xFFFF_FFFF_FFFF_FFFF) {
              D.print("index full stable" # debug_show(beforeSize) );
              return #err(#IndexFull);
            };
            items.currentPages += 1;
            
          };

          RegionLib.storeNat64(items.indexRegion, items.count * elem_size + 0, lastOffset);
          RegionLib.storeNat64(items.indexRegion, items.count * elem_size + 8, newItemSize);

          items.count += 1;
          Nat64.toNat(items.count - 1);

          
        };
        case(#StableTyped(items)){
          let ?this_type_of = type_of else return #err(#TypeRequired);
          let newIndex = (items.count * elem_size_typed) + elem_size_typed; 
          
          if(newIndex > items.currentPages * KiB){
            //grow the index
            let beforeSize = RegionLib.grow(items.indexRegion, 1);
           
            if (beforeSize == 0xFFFF_FFFF_FFFF_FFFF) {
              D.print("index full stable typed" # debug_show(beforeSize) );
              return #err(#IndexFull);
            };
            items.currentPages += 1;
          };


          RegionLib.storeNat64(items.indexRegion, items.count * elem_size_typed + 0, lastOffset);
          RegionLib.storeNat64(items.indexRegion, items.count * elem_size_typed + 8, newItemSize);
          RegionLib.storeNat16(items.indexRegion, items.count * elem_size_typed + 16, Nat16.fromNat(this_type_of));
          items.count += 1;
          Nat64.toNat(items.count - 1);
        };
      };

      RegionLib.storeBlob(store.region, store.currentOffset, item);
      store.currentOffset := newOffset;

      return #ok(new_index);
    };

    /// read a blob stored at the provided index
    public func read(x : Nat) : Blob {
      let x64 = Nat64.fromNat(x);
      let (offset, size) : (Nat64, Nat) = switch(store.items){
        case(#Managed(items)){
          let item = Vec.get<OffsetInfo>(items, x);
          (item.offset, item.size);
        };
        case(#Stable(items)){
          let pos = RegionLib.loadNat64(items.indexRegion, x64 * elem_size);
          let size = RegionLib.loadNat64(items.indexRegion, x64 * elem_size + 8);
          (pos, Nat64.toNat(size));
        };
        case(#StableTyped(items)){
          let pos = RegionLib.loadNat64(items.indexRegion, x64 * elem_size_typed);
          let size = RegionLib.loadNat64(items.indexRegion, x64 * elem_size_typed + 8);
          (pos, Nat64.toNat(size));
        };
      };
      
      let bytes = RegionLib.loadBlob(store.region, offset, size);

      return bytes;
    };

    /// Read the blob and provide the type information if available
    public func readTyped(x : Nat) : (Blob, ?Nat) {
      D.print("reading block in lib typed" # debug_show(x));
      let x64 = Nat64.fromNat(x);
      let (offset, size, type_of) : (Nat64, Nat, ?Nat) = switch(store.items){
        case(#Managed(items)){
          let item = Vec.get<OffsetInfo>(items, x);
          (item.offset, item.size, item.type_of);
        };
        case(#Stable(items)){
          let pos = RegionLib.loadNat64(items.indexRegion, x64 * elem_size);
          let size = RegionLib.loadNat64(items.indexRegion, x64 * elem_size + 8);
          (pos, Nat64.toNat(size), null);
        };
        case(#StableTyped(items)){
          D.print("reading block in lib typed in typed branch" # debug_show(items.count));
          let pos = RegionLib.loadNat64(items.indexRegion, x64 * elem_size_typed);
          let size = RegionLib.loadNat64(items.indexRegion, x64 * elem_size_typed + 8);
          let aType = RegionLib.loadNat16(items.indexRegion, x64 * elem_size_typed + 16);

          D.print("reading read" # debug_show(pos, size, aType));
          (pos, Nat64.toNat(size), ?Nat16.toNat(aType));
        };
      };
      //D.print("reading block in lib " # debug_show(x, itemOffset));
      let bytes = RegionLib.loadBlob(store.region, offset, size);
      //D.print("found bytes " # debug_show(x, bytes));
      return (bytes, type_of);
    };

    /// Update the max pages a memory can handle
    public func updateMaxPages(x: Nat64) : () {
      if(x > store.maxPages){
        store.maxPages := x;
      };
    };

    /// returns the store for use in swapping out streams
    public func toSwappable() : Region{
      return store;
    };


    /// Swaps out the stream for a new stream. Useful for upgrading to different types
    /// Does not eliminate or recover stable memory
    public func swap(new_region : Region) : Stats {
      //what if the maxPages is more/less than before?
      //do we want any safe guards here?
      store := new_region;
      return stats();
    };

    /// Return the stats for the stream
    public func stats() : Stats {
      return{
        region = {
          size = RegionLib.size(store.region);
          id = RegionLib.id(store.region);
        };
        itemCount = switch(store.items){
          case(#Managed(items)){
            Vec.size(items);
          };
          case(#Stable(items)){
            Nat64.toNat(items.count);
          };
          case(#StableTyped(items)){
            Nat64.toNat(items.count);
          };
        };
        maxPages = store.maxPages;
        currentPages = store.currentPages;
        currentOffset = store.currentOffset;
        memory = switch(store.items){
          case(#Managed(items)){
            {
              type_of = #Managed;
              pages = null
            };
          };
          case(#Stable(items)){
            {
              type_of = #Stable;
              pages = ?items.currentPages
            };
          };
          case(#StableTyped(items)){
            {
              type_of = #StableTyped;
              pages = ?items.currentPages
            };
          };
        };
      } ;
    };
  };
};
