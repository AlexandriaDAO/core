# StableWriteOnly.mo

# THIS IS ALPHA and NOT VALIDATED DO NOT USE IN PROD

 A straight line, write only data store designed for icrc3 style ledger archives
 but useful for other situations.
 
 This library uses the Motoko Stable Region base library under the hood to simplify
 the writing of data to a canister that is not expected to change over time.

 Memory is allocated auto allocated as objects are written to the stream.  
 A max pages(in KiB - 65536 per KiB is provided) and defaults to 62500 worth of pages. (4096000000 bytes)
 
 More are supported. Please see the Region.mo file in motoko-base for compiler level flags
 that allow for larger regions.

 ## Installation:

 ```
 mops add stable-write-only
 ```

 ## Usage:

 ```motoko no-repl
 import SW "mo:table-write-only";
 ```

 This Module uses the Class+ pattern discussed at https://forum.dfinity.org/t/writing-motoko-stable-libraries/21201
 It is stable and does not require memory managment.

 ```
  stable var memStore = SW.init({
    maxPages = 64;
    indexType = #Managed;
  });

  let mem = SW.StableWriteOnly(?memStore);
 ```

 Memory is swappable if you end up in a situation where your objects need to be upgraded

 ```
    let newMem = SW.init({maxPages = 32; indexType=#Managed});
    let sw = SW.StableWriteOnly(?newMem);

    let replaceItem = {
      one = 55;
      two = "test55";
      three = 55 : Nat64;
    };

    let result = sw.write(to_candid(replaceItem));

    return oldmem.swap(sw.toSwappable());

 Three different types of memory are offered:
     #Managed - item info is stored in the managed vector and is streamed in and out of 
         memory. This means your index will eventually overrun its ability to be upgraded 
         by the standard motoko upgrade process. (Althoug depending on your other data you 
         may be able to get up to 100M entries)
     #Stable and #StableTyped - these keep their indexes in another region of stable memory.
         stable indexes use two less bytes than stable typed as they are unable to track type info

 For Managed and StableTyped memoreis the library also keeps track of types such that one can tag each write with a
 type annotation without the library needing to know your types ahead of type. You will need
 to provide your own type parser.

 ```
    let x = mem.writeTyped(to_candid(my_testType23_obj), 1)
    let val = mem.readTyped(x);
    let ?type_of = val.1;

    if(type_of == 0){
      return ?#TestType1(
        switch(from_candid(val.0) : ?TestType1){
          case(null) return null;
          case(?val) val;
        });
    } else {
      return ?#TestType3(
        switch(from_candid(val.0) : ?TestType3){
          case(null) return null;
          case(?val) val;
        });
    };
 ```

 The Stable and StableTyped memories are based on Matt Hammer's work at https://github.com/dfinity/motoko/blob/master/doc/md/examples/StableMultiLog.mo

 ## Testing

 At the moment, wasitime does not support system functions like the ones required to manage stable memory, so mops test will fail.

 Testing against the replica can be accomplished by running:

 ```
 //terminal 1
 dfx start --clean --artificial-delay 

 //terminal 2
 dfx deploy test_runner

 dfx canister call test_runner test
 ```
