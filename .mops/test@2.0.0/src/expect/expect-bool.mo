import Bool "mo:base/Bool";
import {fail} "./utils";

module {
	public class ExpectBool(a : Bool) {
		public func isTrue() {
			if (a != true) {
				fail(Bool.toText(a), "", Bool.toText(true));
			};
		};
		public func isFalse() {
			if (a != false) {
				fail(Bool.toText(a), "", Bool.toText(false));
			};
		};
		public func equal(b : Bool) {
			if (a != b) {
				fail(Bool.toText(a), "", Bool.toText(b));
			};
		};
		public func notEqual(b : Bool) {
			if (a == b) {
				fail(Bool.toText(a), "to be !=", Bool.toText(b));
			};
		};
	};
};