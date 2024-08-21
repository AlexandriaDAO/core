import Debug "mo:base/Debug";
import Error "mo:base/Error";
import {bindCompare} "./utils";

module {
	public class ExpectCall(fn : () -> async ()) {
		func show(t : Text) : Text = "\"" # t # "\"";

		public func reject() : async () {
			try {
				await fn();
			}
			catch (err) {
				if (Error.code(err) == #canister_reject) {
					return;
				};
			};
			Debug.trap("expected to throw error");
		};

		// unable to catch
		// public func trap() : async () {
		// 	try {
		// 		await fn();
		// 	}
		// 	catch (err) {
		// 		if (Error.code(err) == #canister_error) {
		// 			return;
		// 		};
		// 	};
		// 	Debug.trap("expected to trap");
		// };
	};
};