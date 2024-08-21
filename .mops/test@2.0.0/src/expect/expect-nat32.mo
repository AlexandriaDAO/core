import Nat32 "mo:base/Nat32";
import {bindCompare} "./utils";

module {
	public class ExpectNat32(val : Nat32) {
		public let equal = bindCompare<Nat32>(val, Nat32.equal, Nat32.toText, "");
		public let notEqual = bindCompare<Nat32>(val, Nat32.notEqual, Nat32.toText, "!=");
		public let less = bindCompare<Nat32>(val, Nat32.less, Nat32.toText, "<");
		public let lessOrEqual = bindCompare<Nat32>(val, Nat32.lessOrEqual, Nat32.toText, "<=");
		public let greater = bindCompare<Nat32>(val, Nat32.greater, Nat32.toText, ">");
		public let greaterOrEqual = bindCompare<Nat32>(val, Nat32.greaterOrEqual, Nat32.toText, ">=");
	};
};