export const hex_decode = (hexString: string) =>
	Uint8Array.from((hexString.match(/.{1,2}/g) as string[]).map((byte) => parseInt(byte, 16)));

export const hex_encode = (bytes: Uint8Array) =>
	bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
