import { Settings } from '#lib/structures/Settings';
import { ArrayString } from '@skyra/env-utilities';

declare module '@skyra/env-utilities' {
	interface Env {
		OWNERS: ArrayString;
		DATABASE_URL: string;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		settings: Settings;
	}
}
