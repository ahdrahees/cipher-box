import StableBuffer "mo:StableBuffer/StableBuffer";

import Principal "mo:base/Principal";
import Map "mo:map/Map";

module {

	public type StableBuffer<T> = StableBuffer.StableBuffer<T>;
	public type Map<K, V> = Map.Map<K, V>;

	public type TOTPId = Nat;
	public type PassId = Nat;

	public type TOTP = {
		// id : Nat;
		encryptedKey : Text;
		// owner : Principal;
		encryptedName : Text;
	};

	/* public type User = {
        // owner : Principal;
        totpIds : StableBuffer<TOTPId>;
        passIds : StableBuffer<PassId>;
    }; */

	///////
	// Avoiding duplecation
	public type TOTP_ = {
		// id : Nat;
		encryptedKey : Text;
		encryptedName : Text;
	};
	public type Password = {
		// id : Nat;
		encryptedName : Text;
		encryptedUsername : Text;
		encryptedPass : Text;
		encryptedUrl : Text;
	};
	public type User = {
		totps : Map.Map<TOTPId, TOTP_>;
		passwords : Map.Map<Nat, Password>;

	};
	public type userMap = Map.Map<Principal, User>;

	public type QueryTOTPs = {
		id : Nat;
		encryptedKey : Text;
		encryptedName : Text;
	};
};
