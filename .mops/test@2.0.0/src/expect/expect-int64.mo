import Int64 "mo:base/Int64";
import {bindCompare} "./utils";

module {
	public class ExpectInt64(val : Int64) {
		public let equal = bindCompare<Int64>(val, Int64.equal, Int64.toText, "");
		public let notEqual = bindCompare<Int64>(val, Int64.notEqual, Int64.toText, "!=");
		public let less = bindCompare<Int64>(val, Int64.less, Int64.toText, "<");
		public let lessOrEqual = bindCompare<Int64>(val, Int64.lessOrEqual, Int64.toText, "<=");
		public let greater = bindCompare<Int64>(val, Int64.greater, Int64.toText, ">");
		public let greaterOrEqual = bindCompare<Int64>(val, Int64.greaterOrEqual, Int64.toText, ">=");
	};
};