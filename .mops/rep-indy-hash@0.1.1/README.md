# RepIndyHash.mo

# THIS IS ALPHA and NOT VALIDATED DO NOT USE IN PROD

Review here: https://forum.dfinity.org/t/review-request-representationally-independent-hash-motoko/24050

See https://github.com/dfinity/ICRC-1/blob/icrc-3/standards/ICRC-3/HASHINGVALUES.md for pseudo cod

ICRC3 requires that transactions be held in a Value type:

```
type Value = variant { 
    Blob : blob; 
    Text : text; 
    Nat : nat; // do we need this or can we just use Int?
    Int : int;
    Array : vec Value; 
    Map : vec record { text; Value }; 
};
```

Each transaction type is defined as a map of a "phash"(not included in the first block) and "tx".  The phash is the hash of the previous transaction.  

```
type ICRC1_Transaction = {
    "phash" : Blob?;
    "tx" : {
        "op" : Text;
        ...
    };
};

```

To get this hash you need to take Representationally Independent Hash of that object

## Install
```
mops add rep-indy-hash
```

## Usage
```motoko
import RepIndy "mo:rep-indy-hash";

// example...
let #ok(hello_world_foo) = Hex.decode("b0c6f9191e37dceafdfc47fbfc7e9cc95f21c7b985c2f7ba5855015c2a8f13ac");

assert Blob.fromArray(ReIndy.hash_val(#Map([
    ("name", #Text("foo")),
    ("message", #Text("Hello World!")),
    ("answer", #Nat(42))
  ]))) == Blob.fromArray(hello_world_foo);
```

See: https://github.com/dfinity/response-verification/blob/main/packages/ic-representation-independent-hash/src/representation_independent_hash.rs

Reference: https://internetcomputer.org/docs/current/references/ic-interface-spec#hash-of-map

Representation-independent hashing of structured data
Structured data, such as (recursive) maps, are authenticated by signing a representation-independent hash of the data. This hash is computed as follows (using SHA256 in the steps below):

For each field that is present in the map (i.e. omitted optional fields are indeed omitted):

concatenate the hash of the field's name (in ascii-encoding, without terminal \x00) and the hash of the value (with the encoding specified below).
Sort these concatenations from low to high

Concatenate the sorted elements, and hash the result.

The resulting hash of 256 bits (32 bytes) is the representation-independent hash.

The following encodings of field values as blobs are used

Binary blobs (canister_id, arg, nonce, module) are used as-is.

Strings (request_type, method_name) are encoded in UTF-8, without a terminal \x00.

Natural numbers (compute_allocation, memory_allocation, ingress_expiry) are encoded using the shortest form Unsigned LEB128 encoding. For example, 0 should be encoded as a single zero byte [0x00] and 624485 should be encoded as byte sequence [0xE5, 0x8E, 0x26].

Integers are encoded using the shortest form Signed LEB128 encoding. For example, 0 should be encoded as a single zero byte [0x00] and -123456 should be encoded as byte sequence [0xC0, 0xBB, 0x78].

Arrays (paths) are encoded as the concatenation of the hashes of the encodings of the array elements.

Maps (sender_delegation) are encoded by recursively computing the representation-independent hash.

The ICRC 3 spec describes them as:

https://github.com/dfinity/ICRC-1/tree/icrc-3/standards/ICRC-3#value-hash

ICRC-3 specifies a standard hash function over Value.

This hash function should be used by Ledgers to calculate the hash of the parent of a transaction and by clients to verify the downloaded transaction log.

The hash function is the representation-independent hashing of structured data used by the IC:

the hash of a Blob is the hash of the bytes themselves
the hash of a Text is the hash of the bytes representing the text
the hash of a Nat is the leb128 encoding of the number
the hash of an Int is the sleb128 encoding of the number
the hash of an Array is the hash of the concatenation of the hashes of all the elements of the array
the hash of a Map is the hash of the concatenation of all the hashed items of the map sorted. A hashed item is the tuple composed by the hash of the key and the hash of the value.


# Credit

This library was almost completely lifted from @nomeata and the https://github.com/nomeata/ic-certification library.  It did not include the encodings for Integer and I had to add the sleb128 encoding, but almost all the credit should go there.