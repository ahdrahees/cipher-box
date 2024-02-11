import { get, writable, type Writable, type Updater } from 'svelte/store';
import {
	type PassId,
	type Password,
	type QueryPassword
} from '../../../../declarations/backend/backend.did';
import { busyStore, toastsStore } from '@dfinity/gix-components';
import { addPassword, deletePassword, getPasswords, updatePassword } from '$lib/api';
import { hex_encode, hex_decode } from '$lib/utils/hex.utils';
import { encryptionKey } from './encryption-key.store';
import { authStore } from '$lib/auth.store';

type EncryptedPasswords = Array<QueryPassword>;
export type DecryptedPasswords = Array<DecryptedPassword>;

type DecryptedPassword = {
	id: bigint;
	url: string;
	username: string;
	name: string;
	pass: string;
};

interface PasswordStoreData {
	encryptedPasswords: EncryptedPasswords;
	decryptedPasswords: DecryptedPasswords;
}

type UpdatePassArg = {
	id: bigint;
	url: string;
	username: string;
	name: string;
	pass: string;
};

interface PasswordStore extends Writable<PasswordStoreData> {
	fetchPass: () => Promise<void>;
	addPass: (password: {
		url: string;
		username: string;
		name: string;
		pass: string;
	}) => Promise<void>;
	deletePass: (passId: PassId) => Promise<void>;
	updatePass: (password: UpdatePassArg) => Promise<void>;
	sync: () => Promise<void>;
	// storeOnLocalStorage, restorefromLocalStorage
}

const init = async (): Promise<PasswordStore> => {
	const { set, update, subscribe } = writable<PasswordStoreData>({
		encryptedPasswords: [],
		decryptedPasswords: []
	});

	return {
		set,
		update,
		subscribe,
		fetchPass: async () => {
			busyStore.startBusy({ initiator: 'fetchPassword', text: 'Fetching passwords...' });

			const result = await getPasswords();

			busyStore.stopBusy('fetchPassword');
			if ('ok' in result) {
				busyStore.startBusy({ initiator: 'decryptingPass', text: 'Decrypting...' });

				const decryptedPasswords = await decryptPasswords(result.ok);

				busyStore.stopBusy('decryptingPass');
				set({ encryptedPasswords: result.ok, decryptedPasswords });
			} else if ('err' in result) {
				if (result.err === 'Anonymous caller not allowed') {
					toastsStore.show({ text: result.err, level: 'error' });
				} else {
					toastsStore.show({ text: result.err, level: 'info' });
				}
			}
		},
		addPass: async (password) => {
			if (get(encryptionKey) !== null) {
				busyStore.startBusy({ initiator: 'addingPass', text: 'Encrypting...' });

				const encryptedPassword = await encryptPassword(password);
				busyStore.startBusy({ initiator: 'addingPass', text: 'Adding to the backend...' });
				const result = await addPassword(encryptedPassword);
				busyStore.stopBusy('addingPass');
				if ('ok' in result) {
					const id = result.ok;

					update((passwordData) => ({
						encryptedPasswords: [...passwordData.encryptedPasswords, { id, ...encryptedPassword }],
						decryptedPasswords: [...passwordData.decryptedPasswords, { id, ...password }]
					}));
					toastsStore.show({ text: 'New password added', level: 'success', duration: 10000 });
				} else if ('err' in result) {
					toastsStore.show({ text: result.err, level: 'error' });
				}
			} else {
				toastsStore.show({ text: 'No symmetric key to encrypt', level: 'error' });
			}
		},
		deletePass: async (passId: PassId) => {
			if (get(authStore).isAuthenticated) {
				busyStore.startBusy({ initiator: 'deletePass', text: 'Deleting...' });
				const result = await deletePassword(passId);
				busyStore.stopBusy('deletePass');
				if ('ok' in result) {
					update((passwordData) => ({
						encryptedPasswords: passwordData.encryptedPasswords.filter(
							(password) => passId !== password.id
						),
						decryptedPasswords: passwordData.decryptedPasswords.filter(
							(password) => passId !== password.id
						)
					}));
				} else if ('err' in result) {
					toastsStore.show({ text: result.err, level: 'error' });
				}
			} else {
				toastsStore.show({ text: 'Not authenticated', level: 'error' });
			}
		},
		updatePass: async (password: UpdatePassArg) => {
			if (get(encryptionKey) !== null) {
				busyStore.startBusy({ initiator: 'updatePass', text: 'Encrypting...' });

				const encryptedPassword = await encryptPassword(password);

				busyStore.startBusy({ initiator: 'updatePass', text: 'Updating...' });

				const result = await updatePassword({ ...password, ...encryptedPassword });

				busyStore.stopBusy('updatePass');

				if ('ok' in result) {
					update((passwordData) => {
						let decryptedPasswords = passwordData.decryptedPasswords;
						const index = decryptedPasswords.findIndex(
							(decryptPass) => decryptPass.id === password.id
						);
						decryptedPasswords[index] = password;

						return { encryptedPasswords: result.ok, decryptedPasswords };
					});
				} else if ('err' in result) {
					toastsStore.show({ text: 'No symmetric key to encrypt', level: 'error' });
				}
			} else {
				toastsStore.show({ text: 'No symmetric key to encrypt', level: 'error' });
			}
		},
		sync: async () => {
			const result = await getPasswords();

			if ('ok' in result) {
				const decryptedPasswords = await decryptPasswords(result.ok);
				set({ encryptedPasswords: result.ok, decryptedPasswords });
			} else if ('err' in result) {
			}
		}
	};
};

export const passwordStore: PasswordStore = await init();

async function encryptPassword(password: {
	url: string;
	username: string;
	name: string;
	pass: string;
}): Promise<Password> {
	if (get(encryptionKey) !== null) {
		const aes_key = await window.crypto.subtle.importKey(
			'raw',
			get(encryptionKey) as BufferSource,
			'AES-GCM',
			false,
			['encrypt']
		);
		return {
			encryptedUrl: await encrypt(aes_key, password.url),
			encryptedUsername: await encrypt(aes_key, password.username),
			encryptedName: await encrypt(aes_key, password.name),
			encryptedPass: await encrypt(aes_key, password.pass)
		};
	} else {
		toastsStore.show({ text: 'No symmetric key to encrypt', level: 'error' });

		return {
			encryptedUrl: '',
			encryptedUsername: '',
			encryptedName: '',
			encryptedPass: ''
		};
	}
}

async function encrypt(aes_key: CryptoKey, text: string): Promise<string> {
	const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bits; unique per message

	const textEncoded = new TextEncoder().encode(text);

	const ciphertext_buffer = await window.crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv: iv },
		aes_key,
		textEncoded
	);

	const ciphertext = new Uint8Array(ciphertext_buffer);

	var iv_and_ciphertext = new Uint8Array(iv.length + ciphertext.length);
	iv_and_ciphertext.set(iv, 0);
	iv_and_ciphertext.set(ciphertext, iv.length);

	return hex_encode(iv_and_ciphertext);
}

async function decryptPasswords(
	encryptedPasswords: EncryptedPasswords
): Promise<DecryptedPasswords> {
	if (get(encryptionKey) !== null) {
		const aes_key = await window.crypto.subtle.importKey(
			'raw',
			get(encryptionKey) as BufferSource,
			'AES-GCM',
			false,
			['decrypt']
		);

		let decryptedPasswords: DecryptedPasswords = [];

		encryptedPasswords.forEach(async (encryptedPass) => {
			decryptedPasswords.push(await decryptAPassword(aes_key, encryptedPass));
		});

		return decryptedPasswords;
	} else {
		toastsStore.show({ text: 'No symmetric key to decrypt', level: 'error' });
		return [];
	}
}

async function decryptAPassword(
	aes_key: CryptoKey,
	password: QueryPassword
): Promise<DecryptedPassword> {
	return {
		id: password.id,
		url: await decrypt(aes_key, password.encryptedUrl),
		username: await decrypt(aes_key, password.encryptedUsername),
		name: await decrypt(aes_key, password.encryptedName),
		pass: await decrypt(aes_key, password.encryptedPass)
	};
}

async function decrypt(aes_key: CryptoKey, ciphertext_hex: string): Promise<string> {
	const iv_and_ciphertext = hex_decode(ciphertext_hex);
	const iv = iv_and_ciphertext.subarray(0, 12); // 96-bits; unique per message
	const ciphertext = iv_and_ciphertext.subarray(12);

	let decrypted = await window.crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: iv },
		aes_key,
		ciphertext
	);
	return new TextDecoder().decode(decrypted);
}
