import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ModalSubmitInteraction, TextChannel } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public async run(interaction: ModalSubmitInteraction) {
		const suggestionContent = interaction.fields.getTextInputValue('suggestInput');
		const channel = interaction.guild?.channels.cache.get('1170314657144254564') as TextChannel;

		// get latest suggestion id from database, if any
		const { suggestions } = await this.container.settings.getGuildSetting(interaction.guildId!);
		const latestSuggestionId = suggestions.length ? suggestions[suggestions.length - 1].id : 0;
		const now = Date.now();
		// write suggestion to database
		suggestions.push({
			id: latestSuggestionId + 1,
			content: suggestionContent,
			author: interaction.user.id,
			createdAt: now
		});

		await this.container.settings.setGuildSetting(interaction.guildId!, { suggestions });

		// send suggestion to suggestions channel
		const msg = await channel.send({
			embeds: [
				{
					title: `Suggestion #${latestSuggestionId + 1}`,
					description: suggestionContent,
					footer: {
						text: `Suggested by ${interaction.user.tag}`,
						icon_url: interaction.user.displayAvatarURL({ forceStatic: false })
					},
					timestamp: new Date(now).toISOString()
				}
			]
		});

		['upvote:1174350343308574864', 'downvote:1174350345430913175'].map(async (emoji) => await msg.react(emoji));

		const thread = await channel.threads.create({
			name: `Suggestion #${latestSuggestionId + 1} Discussion`,
			startMessage: msg.id,
			reason: 'Auto generated thread for suggestion discussion.'
		});

		await thread.send({
			content:
				"We'd love to hear more from you! Feel free to share your thoughts or feedback about this suggestion in this thread. We're here for any discussions you'd like to have!"
		});

		return interaction.reply({
			content: 'Successfully submitted your suggestion! Thank you for making KapeVSC better!',
			ephemeral: true
		});
	}

	public override parse(interaction: ModalSubmitInteraction) {
		if (interaction.customId !== 'modal-suggest') return this.none();

		return this.some();
	}
}
