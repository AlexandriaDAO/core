import Array "mo:base/Array";
import D "mo:base/Debug";
import Vec "mo:vector";
import SW "../src/";

shared(init_msg) actor class Child1(_args : ?SW.IndexType) = this {

  var args = _args;

  public type TestType1 = {
    one: Nat;
    two: Text;
    three: Nat64;
  };

  public type TestType3 = {
    five: {
      #six;
      #seven;
    };
  };

  public type VecTypes = {
    #TestType1: TestType1;
    #TestType3: TestType3;
  };

  stable var testVar = 1;

  stable var memStore = SW.init({
    maxPages = 64;
    indexType = switch(args){
      case(null){ #Managed;};
      case(?val){val};
    };
  });

  let mem = SW.StableWriteOnly(?memStore);

  public query func stats() : async SW.Stats{
    mem.stats();
  };

  public query func read(x : Nat) : async ?TestType1 {
    //D.print("about to read block");
    let val = from_candid(mem.read(x)) : ?TestType1;
    //D.print(" block " # debug_show(val));
    return val;
  };

  public query func test_candid() : async Bool {
    let myitem : TestType1 = {
      one = 1 : Nat;
      two = "test";
      three = 15;
    };

    let myBlob = to_candid(myitem);

    let myItem2 = (from_candid(myBlob) : ? TestType1);

    switch(myItem2){
      case(null) return false;
      case(?val) return (myitem.one == val.one and myitem.two == val.two);
    };
  };

  public shared func putData(x : TestType1) : async SW.WriteResult {
    return mem.write(to_candid(x));
  };

  var dataBlock : ?Vec.Vector<TestType1> = null;

  var dataBlock2: ?Vec.Vector<VecTypes> = null;

  public shared func putLotsOfData(x : Nat) : async SW.Stats {
    let data = switch(dataBlock){
      case(null){
        let buf : Vec.Vector<TestType1> = Vec.new<TestType1>();
        var tracker = 0;
        //D.print("about to write block");
        label proc loop{
          if(tracker % 100000 == 0) D.print("processing data " # debug_show(tracker));
          Vec.add<TestType1>(buf, {
            one = tracker : Nat;
            two = "test";
            three = 15;
          } : TestType1);
          if(tracker % 100000 == 0) D.print("data size " # debug_show(Vec.size(buf)));
          

          tracker := tracker + 1;
          if(tracker >= x){break proc};
          if(tracker % 100000 == 0) D.print("new tracker size " # debug_show(Vec.size(buf)));
        };
        dataBlock := ?buf;
        buf;

      };
      case(?val) val;
    };

    return mem.stats();
  };

  public query func readTyped(x : Nat) : async ?VecTypes {
    D.print("about to read block type");
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
    

  };


  
  public shared func putLotsOfTypedData(x : Nat) : async SW.Stats {
    let data = switch(dataBlock2){
      case(null){
        let buf : Vec.Vector<VecTypes> = Vec.new<VecTypes>();
        var tracker = 0;
        //D.print("about to write block");
        label proc loop{
          if(tracker % 100000 == 0) D.print("processing data " # debug_show(tracker));
          Vec.add<VecTypes>(buf, if(tracker % 2 == 0){
                #TestType1({
                one = tracker : Nat;
                two = "test";
                three = 15;
              } : TestType1)} else {
                #TestType3({
                five = #six;
                eight = "test8";
              })
            }
          
          );
        
          if(tracker % 100000 == 0) D.print("data size " # debug_show(Vec.size(buf)));
          

          tracker := tracker + 1;
          if(tracker >= x){break proc};
          if(tracker % 100000 == 0) D.print("new tracker size " # debug_show(Vec.size(buf)));
        };
        dataBlock2 := ?buf;
        buf;

      };
      case(?val) val;
    };

    var write_tracker = 0;
    label write for(thisItem in Vec.vals<VecTypes>(data)){
      if(write_tracker % 100000 ==0) D.print("writing data " # debug_show(write_tracker));

      switch(thisItem){
        case(#TestType1(val)){
          switch(mem.writeTyped(to_candid(val), 0)){
            case(#err(#MemoryFull)){
              break write;
            };
            case(_){};
          };
        };
        case(#TestType3(val)){
          switch(mem.writeTyped(to_candid(val), 1)){
            case(#err(#MemoryFull)){
              break write;
            };
            case(_){};
          };
        };
      };
      
      write_tracker := write_tracker + 1;
    };
    return mem.stats();
  };

  

  public shared func swapMemory() : async SW.Stats {
    let newMem = SW.init({maxPages = 32; indexType = switch(args){
      case(null){ #Managed;};
      case(?val){val};
    }});
    let sw = SW.StableWriteOnly(?newMem);

    let replaceItem = {
      one = 55;
      two = "test55";
      three = 55 : Nat64;
    };

    let result = sw.write(to_candid(replaceItem));

    return mem.swap(sw.toSwappable());
  };

  public shared func updateMaxPages(x : Nat64) : async SW.Stats {
    mem.updateMaxPages(x);
    return mem.stats();
  };
};