import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';

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
		this.logger.info('Readying database...');
		container.settings.init();

		return super.login(token);
	}

	public override async destroy() {
		this.logger.info('Disconnecting from database...');
		await container.settings._disconnect();

		return super.destroy();
	}
}
