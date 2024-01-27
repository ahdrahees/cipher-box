import Map "mo:map/Map";
import StableBuffer "mo:StableBuffer/StableBuffer";

import T "Types";
import Utils "Utils";

import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Result "mo:base/Result";

shared ({ caller = initializer }) actor class () {

	// Types
	type TOTPId = Nat;
	type TOTP = T.TOTP;
	type Result<Ok, Err> = Result.Result<Ok, Err>;
	type StableBuffer<T> = StableBuffer.StableBuffer<T>;
	type QueryTOTPs = T.QueryTOTPs;

	// Variables
	let { phash; nhash } = Map;

	// Stable Variables
	private stable var totpId : Nat = 1;
	private stable let totpMap = Map.new<TOTPId, TOTP>();
	private stable let ownerTOTPIds = Map.new<Principal, StableBuffer<TOTPId>>();

	// type EncryptedName = Text;
	// private stable let totpMap_ = Map.new<Principal, Map.Map<EncryptedName, T.TOTP>>();

	// Public Functions
	public shared ({ caller }) func add_totp(encryptedKey : Text, encryptedName : Text) : async Result<TOTPId, Text> {
		if (Principal.isAnonymous(caller)) return #err("Anonymous caller not allowed");
		let id = totpId;
		let newTotp : TOTP = {
			encryptedKey;
			encryptedName;
			// id = totpId;
			// owner = caller;
		};

		switch (Map.get(ownerTOTPIds, phash, caller)) {
			case (?totpIdsBuffer) { StableBuffer.add(totpIdsBuffer, id) };
			case (null) {
				let totpIdsBuffer : StableBuffer<TOTPId> = StableBuffer.init();
				StableBuffer.add(totpIdsBuffer, id);
			};
		};
		Map.set(totpMap, nhash, id, { encryptedKey; encryptedName });
		totpId += 1;
		#ok(id)

	};

	public shared ({ caller }) func get_totps() : async Result<[QueryTOTPs], Text> {
		if (Principal.isAnonymous(caller)) return #err("Anonymous caller not allowed");

		switch (Map.get(ownerTOTPIds, phash, caller)) {
			case (?totpIdsBuffer) {
				#ok(Utils.getTOTPS(totpMap, totpIdsBuffer));
			};
			case (null) {
				#err("Could not find TOTP key");
			};
		};
	};

	public shared ({ caller }) func delete_totp(id : TOTPId) : async Result<(), Text> {
		if (Principal.isAnonymous(caller)) return #err("Anonymous caller not allowed");

		let (?totpIdsBuffer) = Map.get(ownerTOTPIds, phash, caller) else return #err("Error: You have no TOTP keys");
		// let (?idIndex) = StableBuffer.indexOF or StableBuffer.binarySearch
		#ok();
	};

	public shared query ({ caller }) func cycle_balance() : async Nat {
		Cycles.balance();
	};

	public func get_initializer() : async Text {
		return Principal.toText(initializer);
	};
};
