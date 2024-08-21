import Array "mo:base-0.7.3/Array";
import Char "mo:base-0.7.3/Char";
import Iter "mo:base-0.7.3/Iter";
import Nat8 "mo:base-0.7.3/Nat8";
import Nat32 "mo:base-0.7.3/Nat32";
import Text "mo:base-0.7.3/Text";

module {
    public func arrayToText(xs : [Nat8]) : Text {
        Text.fromIter(Iter.fromArray(
            Array.map<Nat8, Char>(
                xs,
                func (n : Nat8) : Char {
                    Char.fromNat32(Nat32.fromNat(Nat8.toNat(n)))
                },
            ),
        ));
    };

    public func textToArray(t : Text) : [Nat8] {
        Array.map<Char, Nat8>(
            Iter.toArray(t.chars()),
            func (c : Char) : Nat8 {
                Nat8.fromNat(Nat32.toNat(Char.toNat32(c)));
            },
        );
    };
};
