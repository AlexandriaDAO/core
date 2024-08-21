import Nat64 "mo:base/Nat64";
import {bindCompare} "./utils";

module {
	public class ExpectNat64(val : Nat64) {
		public let equal = bindCompare<Nat64>(val, Nat64.equal, Nat64.toText, "");
		public let notEqual = bindCompare<Nat64>(val, Nat64.notEqual, Nat64.toText, "!=");
		public let less = bindCompare<Nat64>(val, Nat64.less, Nat64.toText, "<");
		public let lessOrEqual = bindCompare<Nat64>(val, Nat64.lessOrEqual, Nat64.toText, "<=");
		public let greater = bindCompare<Nat64>(val, Nat64.greater, Nat64.toText, ">");
		public let greaterOrEqual = bindCompare<Nat64>(val, Nat64.greaterOrEqual, Nat64.toText, ">=");
	};
};