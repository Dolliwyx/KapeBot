import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';
import { Setting } from '#lib/structures/Setting';
import { User } from '#schemas/User';
import { Guild } from '#schemas/Guild';

export class KapeClient extends SapphireClient {
	constructor() {
		super({
			defaultPrefix: 'k!',
			regexPrefix: /^(hey +)?kape[,! ]/i,
			caseInsensitiveCommands: true,
			logger: {
				level: LogLevel.Debug
			},
			shards: 'auto',
			intents: [
				GatewayIntentBits.DirectMessageReactions,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.GuildModeration,
				GatewayIntentBits.GuildEmojisAndStickers,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.MessageContent
			],
			partials: [Partials.Channel],
			loadMessageCommandListeners: true,
			typing: true,
			presence: {
				activities: [{ name: 'Kape VSC', type: 3 }]
			}
		});
	}

	public override async login(token?: string) {
		this.logger.info('[Settings] Readying database...');
		const dbUrl = `postgres://${process.env.POSTGRES_USERNAME}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
		container.settings = {
			users: new Setting('userSettings', 'postgres', new URL(dbUrl), User),
			guilds: new Setting('guildSettings', 'postgres', new URL(dbUrl), Guild)
		};

		return super.login(token);
	}

	public override async destroy() {
		this.logger.info('Disconnecting from database...');
		await container.settings.users._disconnect();
		await container.settings.guilds._disconnect();

		return super.destroy();
	}
}
