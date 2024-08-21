import Nat "mo:base/Nat";
import {bindCompare} "./utils";

module {
	public class ExpectNat(val : Nat) {
		public let equal = bindCompare<Nat>(val, Nat.equal, Nat.toText, "");
		public let notEqual = bindCompare<Nat>(val, Nat.notEqual, Nat.toText, "!=");
		public let less = bindCompare<Nat>(val, Nat.less, Nat.toText, "<");
		public let lessOrEqual = bindCompare<Nat>(val, Nat.lessOrEqual, Nat.toText, "<=");
		public let greater = bindCompare<Nat>(val, Nat.greater, Nat.toText, ">");
		public let greaterOrEqual = bindCompare<Nat>(val, Nat.greaterOrEqual, Nat.toText, ">=");
	};
};