import {bindCompare; fail = _fail} "./utils";
import ExpectCall "./expect-call";

module {
	public let expectAsync = {
		call = ExpectCall.ExpectCall;
	};
};