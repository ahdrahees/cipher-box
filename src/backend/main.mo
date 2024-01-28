import Map "mo:map/Map";
import StableBuffer "mo:StableBuffer/StableBuffer";

import T "Types";
import Utils "Utils";

import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Result "mo:base/Result";
import Nat "mo:base/Nat";

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
				// return #ok([]); // possible outputs
				#err("You have no TOTP keys");
			};
		};
	};

	public shared ({ caller }) func delete_totp(id : TOTPId) : async Result<(), Text> {
		if (Principal.isAnonymous(caller)) return #err("Anonymous caller not allowed");

		let (?totpIdsBuffer) = Map.get(ownerTOTPIds, phash, caller) else return #err("Error: You have no TOTP keys");
		// let (?idIndex) = StableBuffer.indexOf(id, totpIdsBuffer, Nat.equal) else return #err("Error: Could not find TOTP key");
		// binarySearch in this case very efficient because of our buffer will be always sorted becuase of the ids increasing in ascending order when user add new totps and it is added end of the buffer always
		let (?idIndex) = StableBuffer.binarySearch(id, totpIdsBuffer, Nat.compare) else return #err("Error: Could not find TOTP key");

		// Not necessory to Double check. directly can delete
		// let (?totp) = Map.get(totpMap, nhash, id) else return #err("Error: Could not find TOTP key in Map");
		// if (not Map.has(totpMap, nhash, id)) return #err("Error: Could not find TOTP key in Map");

		let totpId = StableBuffer.remove(totpIdsBuffer, idIndex);
		if (StableBuffer.size(totpIdsBuffer) == 0) { Map.delete(ownerTOTPIds, phash, caller) };
		// Map.delete(totpMap, nhash, id);
		let (?deletedTOTP) = Map.remove(totpMap, nhash, id) else return #err("Error: Could not find TOTP key in Map");
		// #ok("Deleted");
		#ok();
	};

	// returns all the TOTPS
	public shared ({ caller }) func update_totp({ id; encryptedKey; encryptedName } : QueryTOTPs) : async Result<[QueryTOTPs], Text> {
		if (Principal.isAnonymous(caller)) return #err("Anonymous caller not allowed");

		let (?totpIdsBuffer) = Map.get(ownerTOTPIds, phash, caller) else return #err("Error: You have no TOTP keys");
		let (?idIndex) = StableBuffer.binarySearch(id, totpIdsBuffer, Nat.compare) else return #err("Error: Could not find TOTP key to update");
		// let (?totp) = Map.get(totpMap, nhash, id) else return #err("Error: Could not find TOTP key in Map");
		let (?previousTOTP) = Map.replace(totpMap, nhash, id, { encryptedKey; encryptedName }) else {
			return #err("Error: Could not find TOTP key in Map");
		};
		// returning all TOTPS including updated one
		#ok(Utils.getTOTPS(totpMap, totpIdsBuffer));

	};

	public shared query ({ caller }) func cycle_balance() : async Nat {
		Cycles.balance();
	};

	public func get_initializer() : async Text {
		return Principal.toText(initializer);
	};
};
