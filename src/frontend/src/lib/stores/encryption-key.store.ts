import { authStore } from '$lib/auth.store';
import { onDestroy } from 'svelte';
import { type Readable, writable, get } from 'svelte/store';
import * as vetkd from 'ic-vetkd-utils';
import { busyStore } from '@dfinity/gix-components';
import { encryptedSymmetricKeyForCaller, symmetricKeyVerificationKey } from '$lib/api';
import { hex_decode } from '$lib/utils/hex.utils';

type EncryptedKeyData = Uint8Array | null;

interface EncryptedKey extends Readable<EncryptedKeyData> {
	updateEncryptedKey: () => Promise<void>;
}

const init = async (): Promise<EncryptedKey> => {
	const { subscribe, set } = writable<EncryptedKeyData>(null);

	return {
		subscribe,
		updateEncryptedKey: async () => {
			if (get(authStore).isAuthenticated) {
				busyStore.startBusy({ initiator: 'fetchSymmetricKey', text: 'Fetching symmetric key...' });

				const seed = window.crypto.getRandomValues(new Uint8Array(32));
				const transportSecretKey = new vetkd.TransportSecretKey(seed);

				const encryptedKeyBytesHex = await encryptedSymmetricKeyForCaller(
					transportSecretKey.public_key()
				);

				const publicKeyBytesHex = await symmetricKeyVerificationKey();

				const aes_256_key = transportSecretKey.decrypt_and_hash(
					hex_decode(encryptedKeyBytesHex),
					hex_decode(publicKeyBytesHex),
					get(authStore).identity.getPrincipal().toUint8Array(),
					32,
					new TextEncoder().encode('aes-256-gcm')
				);
				busyStore.stopBusy('fetchSymmetricKey');
				return set(aes_256_key);
			}
			return set(null);
		}
	};
};

export const encryptionKey: EncryptedKey = await init();
