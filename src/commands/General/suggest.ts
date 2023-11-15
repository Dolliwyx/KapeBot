import { TextInputBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputStyle } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Got a suggestion? Use this command to submit it! Opens a modal.'
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName(this.name)
					.setDescription(this.description),
			{ guildIds: ['1105285463998218432'] }
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const modal = new ModalBuilder().setCustomId('modal-suggest').setTitle('Create a suggestion');
		const suggestion = new TextInputBuilder()
			.setCustomId('suggestInput')
			.setLabel('What is your suggestion?')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true);
		const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(suggestion);

		modal.addComponents(firstActionRow);

		return interaction.showModal(modal);
	}
}
