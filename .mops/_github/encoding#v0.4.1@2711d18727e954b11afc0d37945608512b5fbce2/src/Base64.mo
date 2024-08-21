import Array "mo:base-0.7.3/Array";
import Nat "mo:base-0.7.3/Nat";
import Nat8 "mo:base-0.7.3/Nat8";
import Nat32 "mo:base-0.7.3/Nat32";
import Nat64 "mo:base-0.7.3/Nat64";
import Result "mo:base-0.7.3/Result";

module Base64 {
    public module StdEncoding {
        private let encodeStd = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        private let encodeMap : [Nat8] = [
             65,  66,  67,  68,  69,  70,  71,  72,
             73,  74,  75,  76,  77,  78,  79,  80,
             81,  82,  83,  84,  85,  86,  87,  88,
             89,  90,  97,  98,  99, 100, 101, 102,
            103, 104, 105, 106, 107, 108, 109, 110,
            111, 112, 113, 114, 115, 116, 117, 118,
            119, 120, 121, 122,  48,  49,  50,  51,
             52,  53,  54,  55,  56,  57,  43,  47,
        ];

        private let decodeMap : [Nat8] = [
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,  62, 255, 255, 255,  63,
            52,  53,  54,  55,  56,  57,  58,  59,  60,  61, 255, 255, 255, 255, 255, 255,
            255,   0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,
            15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25, 255, 255, 255, 255, 255,
            255,  26,  27,  28,  29,  30,  31,  32,  33,  34,  35,  36,  37,  38,  39,  40,
            41,  42,  43,  44,  45,  46,  47,  48,  49,  50,  51, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        ];

        public func encode(data : [Nat8]) : [Nat8] = Base64.encode(data, encodeMap);

        public func decode(data : [Nat8]) : Result.Result<[Nat8], Text> = Base64.decode(data, decodeMap);
    };

    public module URLEncoding {
        private let encodeStd = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

        public let encodeMap : [Nat8] = [
             65,  66,  67,  68,  69,  70,  71,  72,
             73,  74,  75,  76,  77,  78,  79,  80,
             81,  82,  83,  84,  85,  86,  87,  88,
             89,  90,  97,  98,  99, 100, 101, 102,
            103, 104, 105, 106, 107, 108, 109, 110,
            111, 112, 113, 114, 115, 116, 117, 118,
            119, 120, 121, 122,  48,  49,  50,  51,
             52,  53,  54,  55,  56,  57,  45,  95,
        ];

        private let decodeMap : [Nat8] = [
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,  62, 255, 255,
             52,  53,  54,  55,  56,  57,  58,  59,  60,  61, 255, 255, 255, 255, 255, 255,
            255,   0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,
             15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25, 255, 255, 255, 255,  63,
            255,  26,  27,  28,  29,  30,  31,  32,  33,  34,  35,  36,  37,  38,  39,  40,
             41,  42,  43,  44,  45,  46,  47,  48,  49,  50,  51, 255, 255, 255, 255, 255,
             255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
             255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
             255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
             255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
             255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
             255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
             255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
             255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255
        ];

        public func encode(data : [Nat8]) : [Nat8] = Base64.encode(data, encodeMap);

        public func decode(data : [Nat8]) : Result.Result<[Nat8], Text> = Base64.decode(data, decodeMap);
    };

    private func encodeLen(n : Nat) : Nat {
        (n * 8 + 5) / 6;
    };

    public func encode(data : [Nat8], encodeMap : [Nat8]) : [Nat8] {
        if (data.size() == 0) { return []; };

        var i = 0;
        var s = 0;
        let n = (data.size() / 3) * 3;
        let dst = Array.init<Nat8>(encodeLen(data.size()), 0);
        while (s < n) {
            let v = nat8to32(data[s]) << 16 | nat8to32(data[s+1]) << 8 | nat8to32(data[s+2]);
            dst[i  ] := encodeMap[Nat32.toNat(v >> 18 & 0x3F)];
            dst[i+1] := encodeMap[Nat32.toNat(v >> 12 & 0x3F)];
            dst[i+2] := encodeMap[Nat32.toNat(v >> 6  & 0x3F)];
            dst[i+3] := encodeMap[Nat32.toNat(v       & 0x3F)];
            i += 4; s += 3;
        };

        let r : Nat = data.size() - s;
        if (r == 0) return Array.freeze(dst);
        var v = nat8to32(data[s]) << 16;
        if (r == 2) v |= nat8to32(data[s+1]) << 8;
        dst[i  ] := encodeMap[Nat32.toNat(v >> 18 & 0x3F)];
        dst[i+1] := encodeMap[Nat32.toNat(v >> 12 & 0x3F)];
        if (r == 2) dst[i+2] := encodeMap[Nat32.toNat(v >> 6  & 0x3F)];
        Array.freeze(dst);
    };

    private func nat8to32(n : Nat8) : Nat32 {
        Nat32.fromNat(Nat8.toNat(n));
    };

    private func decodeLen(n : Nat) : Nat {
        n * 6 / 8;
    };

    public func decode(data : [Nat8], decodeMap : [Nat8]) : Result.Result<[Nat8], Text> {
        if (data.size() == 0) { return #ok([]); };

        var si = 0;
        var n   = 0;
        let dst = Array.init<Nat8>(decodeLen(data.size()), 0);
        while ((data.size() - si : Nat) >= 8 and (dst.size() - n : Nat) >= 8) switch (assemble64(
            decodeMap[Nat8.toNat(data[si])],
            decodeMap[Nat8.toNat(data[si + 1])],
            decodeMap[Nat8.toNat(data[si + 2])],
            decodeMap[Nat8.toNat(data[si + 3])],
            decodeMap[Nat8.toNat(data[si + 4])],
            decodeMap[Nat8.toNat(data[si + 5])],
            decodeMap[Nat8.toNat(data[si + 6])],
            decodeMap[Nat8.toNat(data[si + 7])],
        )) {
            case (? n64) {
                dst[n]     := Nat8.fromIntWrap(Nat64.toNat(n64 >> 56));
                dst[n + 1] := Nat8.fromIntWrap(Nat64.toNat(n64 >> 48));
                dst[n + 2] := Nat8.fromIntWrap(Nat64.toNat(n64 >> 40));
                dst[n + 3] := Nat8.fromIntWrap(Nat64.toNat(n64 >> 32));
                dst[n + 4] := Nat8.fromIntWrap(Nat64.toNat(n64 >> 24));
                dst[n + 5] := Nat8.fromIntWrap(Nat64.toNat(n64 >> 16));
                dst[n + 6] := Nat8.fromIntWrap(Nat64.toNat(n64 >> 8));
                dst[n + 7] := Nat8.fromIntWrap(Nat64.toNat(n64));
                n += 6;
                si += 8;
            };
            case (null) switch (decodeQuantum(decodeMap, dst, n, data, si)) {
                case (#err(e)) return #err(e);
                case (#ok(i, nn)) {
                    si := i;
                    n += nn;
                };
            };
        };

        while ((data.size() - si : Nat) >= 4 and (dst.size() - n : Nat) >= 4) switch (assemble32(
            decodeMap[Nat8.toNat(data[si])],
            decodeMap[Nat8.toNat(data[si + 1])],
            decodeMap[Nat8.toNat(data[si + 2])],
            decodeMap[Nat8.toNat(data[si + 3])],
        )) {
            case (? n32) {
                dst[n]     := Nat8.fromIntWrap(Nat32.toNat(n32 >> 24));
                dst[n + 1] := Nat8.fromIntWrap(Nat32.toNat(n32 >> 16));
                dst[n + 2] := Nat8.fromIntWrap(Nat32.toNat(n32 >> 8));
                dst[n + 3] := Nat8.fromIntWrap(Nat32.toNat(n32));
                n += 3;
                si += 4;
            };
            case (null) switch (decodeQuantum(decodeMap, dst, n, data, si)) {
                case (#err(e)) return #err(e);
                case (#ok(i, nn)) {
                    si := i;
                    n += nn;
                };
            };
        };

        while (si < data.size()) switch (decodeQuantum(decodeMap, dst, n, data, si)) {
            case (#err(e)) return #err(e);
            case (#ok(i, nn)) {
                si := i;
                n += nn;
            };
        };
        #ok(Array.freeze(dst));
    };

    private func assemble32(b0 : Nat8, b1 : Nat8, b2 : Nat8, b3 : Nat8) : ?Nat32 {
        if (b0 | b1 | b2 | b3 == 0xff) return null;
        return ?(Nat32.fromNat(Nat8.toNat(b0)) << 26
               | Nat32.fromNat(Nat8.toNat(b1)) << 20
               | Nat32.fromNat(Nat8.toNat(b2)) << 14
               | Nat32.fromNat(Nat8.toNat(b3)) << 8);
    };

    private func assemble64(b0 : Nat8, b1 : Nat8, b2 : Nat8, b3 : Nat8, b4 : Nat8, b5 : Nat8, b6 : Nat8, b7 : Nat8) : ?Nat64 {
        if (b0 | b1 | b2 | b3 | b4 | b5 | b6 | b7 == 0xff) return null;
        return ?(Nat64.fromNat(Nat8.toNat(b0)) << 58
               | Nat64.fromNat(Nat8.toNat(b1)) << 52
               | Nat64.fromNat(Nat8.toNat(b2)) << 46
               | Nat64.fromNat(Nat8.toNat(b3)) << 40
               | Nat64.fromNat(Nat8.toNat(b4)) << 34
               | Nat64.fromNat(Nat8.toNat(b5)) << 28
               | Nat64.fromNat(Nat8.toNat(b6)) << 22
               | Nat64.fromNat(Nat8.toNat(b7)) << 16);
    };

    private func corruptInputError(si : Nat) : Result.Result<(Nat, Nat), Text> = #err(
        "illegal base64 data at input byte at " # Nat.toText(si)
    );

    private func decodeQuantum(decodeMap : [Nat8], dst : [var Nat8], n : Nat, src : [Nat8], i : Nat) : Result.Result<(Nat, Nat), Text> {
        var si = i;
        let dstBuffer = Array.init<Nat8>(4, 0);
        var dstLen = 4;
        var j = 0;
        label l while (j < 4) {
            if (src.size() == si) {
                if (j == 0) return #ok(si, 0);
                if (j == 1) return corruptInputError(si - j);
                dstLen := j;
                break l;
            };
            let input = src[si];
            si += 1;
            let output = decodeMap[Nat8.toNat(input)];
            if (output != 0xff) {
                dstBuffer[j] := output;
                j += 1; continue l;
            };
            if (input == 10 or input == 13) continue l; // \n or \r
            return corruptInputError(si - 1); // padding?
        };

        // 4x6bit to 3 bytes
        let v = Nat32.fromNat(Nat8.toNat(dstBuffer[0])) << 18
                | Nat32.fromNat(Nat8.toNat(dstBuffer[1])) << 12
                | Nat32.fromNat(Nat8.toNat(dstBuffer[2])) << 6
                | Nat32.fromNat(Nat8.toNat(dstBuffer[3]));
        dstBuffer[2] := Nat8.fromIntWrap(Nat32.toNat(v >> 0));
        dstBuffer[1] := Nat8.fromIntWrap(Nat32.toNat(v >> 8));
        dstBuffer[0] := Nat8.fromIntWrap(Nat32.toNat(v >> 16));
        if (dstLen == 4) dst[n + 2] := dstBuffer[2];
        if (dstLen >= 3) dst[n + 1] := dstBuffer[1];
        if (dstLen >= 2) dst[n]     := dstBuffer[0];
        #ok(si, dstLen - 1);
    };
};
