import Array "mo:base/Array";
import D "mo:base/Debug";
import Vec "mo:vector";
import SW "../src/";



shared(init_msg) actor class Child2() = this {

  public type TestType1 = {
    one: Nat;
    two: Text;
    three: Nat64;
  };

  stable var testVar = 1;
  stable var testVar2 = 3;

  stable var memStore = SW.init({
    maxPages = 64;
    indexType = #Managed;
  });

  let mem = SW.StableWriteOnly(?memStore);

  public query func stats() : async SW.Stats{
    mem.stats();
  };

  public query func read(x : Nat) : async ?TestType1 {
    return (from_candid(mem.read(x)) : ?TestType1);
  };

  public shared func putData(x : TestType1) : async SW.WriteResult {
    return mem.write(to_candid(x));
  };

  var dataBlock : ?Vec.Vector<TestType1> = null;


  public shared func putLotsOfData(x : Nat) : async SW.Stats {
    let data = switch(dataBlock){
      case(null){
        let buf : Vec.Vector<TestType1> = Vec.new<TestType1>();
        var tracker = 0;
        label proc loop{
          Vec.add<TestType1>(buf, {
            one = tracker : Nat;
            two = "test";
            three = 15;
          } : TestType1);
          

          tracker := tracker + 1;
          if(tracker >= x){break proc};
          if(tracker % 100 == 0) D.print("new tracker size " # debug_show(Vec.size(buf)));
        };
        dataBlock := ?buf;
        buf;

      };
      case(?val) val;
    };

    

    

    for(thisItem in Vec.vals<TestType1>(data)){
      ignore mem.write(to_candid(x));
    };
    return mem.stats();
  };

  public type VecTypes = {
    #TestType1: TestType1;
    #TestType3: TestType3;
  };

   public type TestType3 = {
    five: {
      #six;
      #seven;
    };
  };

  public query func readTyped(x : Nat) : async ?VecTypes {
    //D.print("about to read block");
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
};