import { decode; encode} = "../src/Base32";
import util "util";

assert(
    encode([102, 111, 111, 32, 98, 97, 114])
    == [77, 90, 88, 87, 54, 73, 68, 67, 77, 70, 90, 65]
); // "foo bar"

assert(
    decode([77, 90, 88, 87, 54, 73, 68, 67, 77, 70, 90, 65])
    == #ok([102, 111, 111, 32, 98, 97, 114])
); // "foo bar"

for ((text, encoded) in [
    ("", ""),
    ("f", "MY"),
    ("fo", "MZXQ"),
    ("foo", "MZXW6"),
    ("foo bar", "MZXW6IDCMFZA")
].vals()) {
    let e = encode(util.textToArray(text));
    assert(util.arrayToText(e) == encoded);
    switch (decode(e)) {
        case (#err(_)) { assert(false); };
        case (#ok(d)) { assert(util.arrayToText(d) == text); };
    };
};
