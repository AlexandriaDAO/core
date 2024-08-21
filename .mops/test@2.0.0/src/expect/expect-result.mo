import Result "mo:base/Result";
import {fail} "./utils";

module {
	public class ExpectResult<Ok, Err>(val : Result.Result<Ok, Err>, toText : (Result.Result<Ok, Err>) -> Text, equalFn : (Result.Result<Ok, Err>, Result.Result<Ok, Err>) -> Bool) {
		public func isOk() {
			if (Result.isErr(val)) {
				fail(toText(val), "", "#ok(...)");
			};
		};

		public func isErr() {
			if (Result.isOk(val)) {
				fail(toText(val), "", "#err(...)");
			};
		};

		public func equal(other : Result.Result<Ok, Err>) {
			if (not equalFn(val, other)) {
				fail(toText(val), "", toText(other));
			};
		};

		public func notEqual(other : Result.Result<Ok, Err>) {
			if (equalFn(val, other)) {
				fail(toText(val), "!=", toText(other));
			};
		};
	};
};