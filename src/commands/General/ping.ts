import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { type Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'ping pong'
})
export class UserCommand extends Command {
	// Register slash and context menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		// Register slash command
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description
		});
	}

	// Message command
	public override async messageRun(message: Message) {
		const msg = await send(message, 'Ping?');

		const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
			(msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)
		}ms.`;

		return send(message, content);
	}
	// slash command
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const msg = await interaction.reply({ content: 'Ping?', fetchReply: true });

		const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
			msg.createdTimestamp - interaction.createdTimestamp
		}ms.`;

		return await interaction.editReply({
			content: content
		});
	}
}
