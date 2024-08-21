
import Sha256 "mo:sha2/Sha256";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";
import Vec "mo:vector";
import Blob "mo:base/Blob";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";
import IntX "mo:motoko_numbers/IntX";

module {
  /// The Type used to express ICRC3 values
  public type Value = { 
    #Blob : Blob; 
    #Text : Text; 
    #Nat : Nat;
    #Int : Int;
    #Array : [Value]; 
    #Map : [(Text, Value)]; 
  };

  // Also see https://github.com/dfinity/ic-hs/blob/master/src/IC/HTTP/RequestId.hs

  ///Creates the represntatinally independent hash of a Value
  public func hash_val(v : Value) : [Nat8] {
    encode_val(v) |> Sha256.fromArray(#sha256, _) |> Blob.toArray _
  };

  func encode_val(v : Value) : [Nat8] {
    switch (v) {
      case (#Blob(b))   { Blob.toArray(b) };
      case (#Text(t)) { Blob.toArray(Text.encodeUtf8(t)) };
      case (#Nat(n))    { leb128(n) };
      case (#Int(i))    { sleb128(i) };
      case (#Array(a))  { arrayConcat(Iter.map(a.vals(), hash_val)); };
      case (#Map(m))    {
        let entries : Buffer.Buffer<Blob> = Buffer.fromIter(Iter.map(m.vals(), func ((k : Text, v : Value)) : Blob {
            Blob.fromArray(arrayConcat([ hash_val(#Text(k)), hash_val(v) ].vals()));
        }));
        entries.sort(Blob.compare); // No Array.compare, so go through blob
        arrayConcat(Iter.map(entries.vals(), Blob.toArray));
      }
    }
  };

  func leb128(nat : Nat) : [Nat8] {
    var n = nat;
    let buf = Vec.new<Nat8>();
    loop {
      if (n <= 127) {
        Vec.add(buf, Nat8.fromNat(n));
        return Vec.toArray(buf);
      };
      Vec.add(buf, Nat8.fromIntWrap(n) | 0x80);
      n /= 128;
    }
  };

  func sleb128(i : Int) : [Nat8] {
    let aBuf = Buffer.Buffer<Nat8>(1);
    IntX.encodeInt(aBuf, i, #signedLEB128);

    Buffer.toArray(aBuf);
  };

  /* func sleb128(i : Int) : [Nat8] {
    let isNeg = i < 0;
    var result = Vec.new<Nat8>();
    var value = if (isNeg) -i else i;
    label proc loop {
        // Exit conditions
        if (value == 0) {
            if (isNeg) {
                if (Vec.size(result) == 0) {
                    break proc;
                } else if (Vec.get(result, Vec.size(result) - 1) >= 128) {
                    break proc;
                }
            } else {
                break proc;
            };
        };

        var byte = value % 128;
        value /= 128;

        if (value != 0 or (isNeg and byte != 0)) {
            byte := byte + 128;
        };

        Vec.add(result, Nat8.fromNat(Int.abs(byte)));
    };
    Vec.toArray(result);
  }; */

  func h(b1 : Blob) : Blob {
    Sha256.fromBlob(#sha256, b1);
  };

  // Missing in standard library? Faster implementation?
  func bufferAppend<X>(buf : Vec.Vector<X>, a : [X]) {
    Vec.addFromIter<X>(buf, a.vals());
  };

  // Array concat
  func arrayConcat<X>(as : Iter.Iter<[X]>) : [X] {
    let buf = Vec.new<X>();
    for(thisItem in as){
      Vec.addFromIter(buf, thisItem.vals());
    };
    Vec.toArray(buf);
  };
};
