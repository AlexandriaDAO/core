import Int8 "mo:base/Int8";
import {bindCompare} "./utils";

module {
	public class ExpectInt8(val : Int8) {
		public let equal = bindCompare<Int8>(val, Int8.equal, Int8.toText, "");
		public let notEqual = bindCompare<Int8>(val, Int8.notEqual, Int8.toText, "!=");
		public let less = bindCompare<Int8>(val, Int8.less, Int8.toText, "<");
		public let lessOrEqual = bindCompare<Int8>(val, Int8.lessOrEqual, Int8.toText, "<=");
		public let greater = bindCompare<Int8>(val, Int8.greater, Int8.toText, ">");
		public let greaterOrEqual = bindCompare<Int8>(val, Int8.greaterOrEqual, Int8.toText, ">=");
	};
};