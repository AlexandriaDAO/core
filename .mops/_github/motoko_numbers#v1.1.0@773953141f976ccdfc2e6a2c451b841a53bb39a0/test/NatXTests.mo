import Array "mo:base/Array";
import List "mo:base/List";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Char "mo:base/Char";
import Debug "mo:base/Debug";
import Float "mo:base/Float";
import Iter "mo:base/Iter";
import Nat8 "mo:base/Nat8";
import Nat16 "mo:base/Nat16";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Nat "mo:base/Nat";
import NatX "../src/NatX";
import TestUtil "./TestUtil";
import Util "../src/Util";

module {

    public func run() {
        testNat8([0x00], 0);
        testNat8([0x01], 1);
        testNat8([0xff], 255);

        testNat16([0x00, 0x00], 0);
        testNat16([0x00, 0x01], 1);
        testNat16([0x00, 0xff], 255);
        testNat16([0x01, 0x00], 256);
        testNat16([0xff, 0xff], 65535);

        testNat32([0x00, 0x00, 0x00, 0x00], 0);
        testNat32([0x00, 0x00, 0x00, 0x01], 1);
        testNat32([0x00, 0x00, 0x00, 0xff], 255);
        testNat32([0x00, 0x00, 0x01, 0x00], 256);
        testNat32([0x00, 0x00, 0xff, 0xff], 65535);
        testNat32([0xff, 0xff, 0xff, 0xff], 4294967295);

        testNat64([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], 0);
        testNat64([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01], 1);
        testNat64([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff], 255);
        testNat64([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00], 256);
        testNat64([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff], 65535);
        testNat64([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff], 4294967295);
        testNat64([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], 18446744073709551615);

        testNat([0x00], 0, #unsignedLEB128);
        testNat([0x01], 1, #unsignedLEB128);
        testNat([0x7f], 127, #unsignedLEB128);
        testNat([0xe5, 0x8e, 0x26], 624485, #unsignedLEB128);

        testToText(
            0,
            {
                binary = "0";
                decimal = "0";
                hexadecimal = "0";
            },
        );

        testToText(
            1,
            {
                binary = "1";
                decimal = "1";
                hexadecimal = "1";
            },
        );
        testToText(
            9,
            {
                binary = "1001";
                decimal = "9";
                hexadecimal = "9";
            },
        );
        testToText(
            10,
            {
                binary = "1010";
                decimal = "10";
                hexadecimal = "A";
            },
        );
        testToText(
            100,
            {
                binary = "1100100";
                decimal = "100";
                hexadecimal = "64";
            },
        );
        testToText(
            1234567890,
            {
                binary = "1001001100101100000001011010010";
                decimal = "1234567890";
                hexadecimal = "499602D2";
            },
        );
        testToText(
            123456789099999999999999999999999999999999999999999999999999999999999999,
            {
                binary = "100011110001101000100010011011111100001111111100000101010001010010001100000101010110000101011001100000101110110110110000100000101101111010011010101110010100110110111001100101011111111111111111111111111111111111111111111111111111111111111";
                decimal = "123456789099999999999999999999999999999999999999999999999999999999999999";
                hexadecimal = "11E3444DF87F82A29182AC2B305DB6105BD35729B732BFFFFFFFFFFFFFFF";
            },
        );
    };

    private func testToText(value : Nat, expected : { binary : Text; decimal : Text; hexadecimal : Text }) {
        testToTextInternal(value, expected.binary, #binary);
        testToTextInternal(value, expected.decimal, #decimal);
        testToTextInternal(value, expected.hexadecimal, #hexadecimal);
    };

    private func testToTextInternal(value : Nat, expected : Text, base : NatX.Base) {
        let actual = NatX.toTextAdvanced(value, base);
        if (actual != expected) {
            Debug.trap("Failed converting Nat to Text.\n\nExpected:\n" # expected # "\n\nActual:\n" # actual);
        };
        let n = switch (NatX.fromTextAdvanced(actual, base, null)) {
            case (null) Debug.trap("Failed to convert " # debug_show (value) # " to text.");
            case (?n) n;
        };
        if (n != value) {
            Debug.trap("Failed converting Text to Nat.\n\nExpected:\n" # debug_show (value) # "\n\nActual:\n" # debug_show (n));
        };
    };

    private func testNat8(bytes : [Nat8], expected : Nat8) {
        testNatX(NatX.decodeNat8, encodeNat8, Nat8.equal, Nat8.toText, bytes, expected);
    };
    private func testNat16(bytes : [Nat8], expected : Nat16) {
        testNatX(NatX.decodeNat16, NatX.encodeNat16, Nat16.equal, Nat16.toText, bytes, expected);
    };
    private func testNat32(bytes : [Nat8], expected : Nat32) {
        testNatX(NatX.decodeNat32, NatX.encodeNat32, Nat32.equal, Nat32.toText, bytes, expected);
    };
    private func testNat64(bytes : [Nat8], expected : Nat64) {
        testNatX(NatX.decodeNat64, NatX.encodeNat64, Nat64.equal, Nat64.toText, bytes, expected);
    };

    private func testNat(bytes : [Nat8], expected : Nat, encoding : { #unsignedLEB128 }) {
        let actual : ?Nat = NatX.decodeNat(Iter.fromArray(bytes), encoding);
        switch (actual) {
            case (null) Debug.trap("Unable to parse nat from bytes: " # Util.toHexString(bytes));
            case (?a) {
                if (a != expected) {
                    Debug.trap("Expected: " # Nat.toText(expected) # "\nActual: " # Nat.toText(a) # "\nBytes: " # Util.toHexString(bytes));
                };
                let buffer = Buffer.Buffer<Nat8>(bytes.size());
                NatX.encodeNat(buffer, expected, encoding);
                let expectedBytes : [Nat8] = Buffer.toArray(buffer);
                if (not TestUtil.bytesAreEqual(bytes, expectedBytes)) {
                    Debug.trap("Expected Bytes: " # Util.toHexString(expectedBytes) # "\nActual Bytes: " # Util.toHexString(bytes));
                };
            };
        };
    };

    private func encodeNat8(buffer : Buffer.Buffer<Nat8>, value : Nat8, encoding : { #lsb; #msb }) {
        NatX.encodeNat8(buffer, value);
    };

    private func testNatX<T>(
        decode : (Iter.Iter<Nat8>, { #lsb; #msb }) -> ?T,
        encode : (Buffer.Buffer<Nat8>, T, { #lsb; #msb }) -> (),
        equal : (T, T) -> Bool,
        toText : (T) -> Text,
        bytes : [Nat8],
        expected : T,
    ) {
        testNatXInternal<T>(decode, encode, equal, toText, bytes, expected, #msb);
        let reverseBytes = List.toArray(List.reverse(List.fromArray(bytes)));
        testNatXInternal<T>(decode, encode, equal, toText, reverseBytes, expected, #lsb);

    };

    private func testNatXInternal<T>(
        decode : (Iter.Iter<Nat8>, { #lsb; #msb }) -> ?T,
        encode : (Buffer.Buffer<Nat8>, T, { #lsb; #msb }) -> (),
        equal : (T, T) -> Bool,
        toText : (T) -> Text,
        bytes : [Nat8],
        expected : T,
        encoding : { #lsb; #msb },
    ) {
        let actual : ?T = decode(Iter.fromArray(bytes), encoding);
        switch (actual) {
            case (null) Debug.trap("Unable to parse nat from bytes: " # Util.toHexString(bytes));
            case (?a) {
                if (not equal(a, expected)) {
                    Debug.trap("Expected: " # toText(expected) # "\nActual: " # toText(a) # "\nBytes: " # Util.toHexString(bytes));
                };
                let buffer = Buffer.Buffer<Nat8>(bytes.size());
                encode(buffer, expected, encoding);
                let expectedBytes : [Nat8] = Buffer.toArray(buffer);
                if (not TestUtil.bytesAreEqual(bytes, expectedBytes)) {
                    Debug.trap("Expected Bytes: " # Util.toHexString(expectedBytes) # "\nActual Bytes: " # Util.toHexString(bytes));
                };
            };
        };

    };
};
