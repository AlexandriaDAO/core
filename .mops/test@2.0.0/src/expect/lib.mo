import {bindCompare; fail = _fail} "./utils";
import ExpectInt "./expect-int";
import ExpectInt8 "./expect-int8";
import ExpectInt16 "./expect-int16";
import ExpectInt32 "./expect-int32";
import ExpectInt64 "./expect-int64";
import ExpectNat "./expect-nat";
import ExpectNat8 "./expect-nat8";
import ExpectNat16 "./expect-nat16";
import ExpectNat32 "./expect-nat32";
import ExpectNat64 "./expect-nat64";
import ExpectChar "./expect-char";
import ExpectText "./expect-text";
import ExpectBool "./expect-bool";
import ExpectArray "./expect-array";
import ExpectBlob "./expect-blob";
import ExpectPrincipal "./expect-principal";
import ExpectOption "./expect-option";
import ExpectResult "./expect-result";

module {
	public let expect = {
		bool = ExpectBool.ExpectBool;
		int = ExpectInt.ExpectInt;
		int8 = ExpectInt8.ExpectInt8;
		int16 = ExpectInt16.ExpectInt16;
		int32 = ExpectInt32.ExpectInt32;
		int64 = ExpectInt64.ExpectInt64;
		nat = ExpectNat.ExpectNat;
		nat8 = ExpectNat8.ExpectNat8;
		nat16 = ExpectNat16.ExpectNat16;
		nat32 = ExpectNat32.ExpectNat32;
		nat64 = ExpectNat64.ExpectNat64;
		char = ExpectChar.ExpectChar;
		text = ExpectText.ExpectText;
		array = ExpectArray.ExpectArray;
		blob = ExpectBlob.ExpectBlob;
		principal = ExpectPrincipal.ExpectPrincipal;
		option = ExpectOption.ExpectOption;
		result = ExpectResult.ExpectResult;
	};

	public let fail = _fail;
};