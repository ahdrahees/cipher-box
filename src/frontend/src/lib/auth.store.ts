import { type Identity, type ActorSubclass, AnonymousIdentity } from '@dfinity/agent';
import type { _SERVICE } from '../../../declarations/backend/backend.did';
import { writable, type Readable } from 'svelte/store';
import { AuthClient } from '@dfinity/auth-client';
import { getActor } from './actor';
import { goto } from '$app/navigation';

export interface AuthStoreData {
	isAuthenticated: boolean;
	identity: Identity;
	actor: ActorSubclass<_SERVICE>;
}

export interface AuthStore extends Readable<AuthStoreData> {
	sync: () => Promise<void>;
	signIn: () => Promise<void>;
	signOut: () => Promise<void>;
}

let authClient: AuthClient | null | undefined;

const anonIdentity = new AnonymousIdentity();
const anonActor: ActorSubclass<_SERVICE> = await getActor(anonIdentity);

const init = async (): Promise<AuthStore> => {
	const { subscribe, set } = writable<AuthStoreData>({
		isAuthenticated: false,
		identity: new AnonymousIdentity(),
		actor: anonActor
	});

	return {
		subscribe,
		sync: async () => {
			authClient = authClient ?? (await AuthClient.create());
			const isAuthenticated: boolean = await authClient.isAuthenticated();

			if (isAuthenticated) {
				const signIdentity = authClient.getIdentity();
				const authActor = await getActor(signIdentity);

				return set({
					isAuthenticated,
					identity: signIdentity,
					actor: authActor
				});
			}
			return set({ isAuthenticated, identity: anonIdentity, actor: anonActor });
		},
		signIn: async () =>
			new Promise<void>(async (resolve, reject) => {
				authClient = authClient ?? (await AuthClient.create());

				const identityProvider = import.meta.env.DEV
					? 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080/'
					: 'https://identity.internetcomputer.org/';
				await authClient.login({
					identityProvider,
					maxTimeToLive: BigInt(7) * BigInt(24) * BigInt(3_600_000_000_000), // 1 week
					onSuccess: async () => {
						await sync();
						goto('/');
						resolve();
					},
					onError: reject
				});
			}),
		signOut: async () => {
			const client = authClient ?? (await AuthClient.create());
			client.logout();

			// This fix a "sign in -> sign out -> sign in again" flow without window reload.
			authClient = null;

			set({ isAuthenticated: false, identity: anonIdentity, actor: anonActor });
		}
	};
};

export const authStore: AuthStore = await init();
const sync = async () => await authStore.sync();
