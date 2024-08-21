import Text "mo:base/Text";
import {bindCompare} "./utils";

module {
	public class ExpectText(val : Text) {
		func show(t : Text) : Text = "\"" # t # "\"";

		public let equal = bindCompare<Text>(val, Text.equal, show, "");
		public let notEqual = bindCompare<Text>(val, Text.notEqual, show, "!=");
		public let less = bindCompare<Text>(val, Text.less, show, "<");
		public let lessOrEqual = bindCompare<Text>(val, Text.lessOrEqual, show, "<=");
		public let greater = bindCompare<Text>(val, Text.greater, show, ">");
		public let greaterOrEqual = bindCompare<Text>(val, Text.greaterOrEqual, show, ">=");
		public let contains = bindCompare<Text>(val, func(a : Text, b) = Text.contains(a, #text b), show, "to contain");
		public let startsWith = bindCompare<Text>(val, func(a : Text, b) = Text.startsWith(a, #text b), show, "to start with");
		public let endsWith = bindCompare<Text>(val, func(a : Text, b) = Text.endsWith(a, #text b), show, "to end with");
	};
};