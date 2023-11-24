import { GuildSchema, UserSchema } from '#lib/schemas';
import { Setting } from '#lib/structures/Setting';
import { ArrayString } from '@skyra/env-utilities';

declare module '@skyra/env-utilities' {
	interface Env {
		OWNERS: ArrayString;
		DATABASE_URL: string;
		POSTGRES_USERNAME: string;
		POSTGRES_PASSWORD: string;
		POSTGRES_HOST: string;
		POSTGRES_PORT: string;
		POSTGRES_DB: string;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		settings: {
			users: Setting<UserSchema>;
			guilds: Setting<GuildSchema>;
		};
	}
}
