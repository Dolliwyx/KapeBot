import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { codeBlock } from '@sapphire/utilities';
import { AutocompleteInteraction, EmbedBuilder, Message, inlineCode, time, userMention } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	description: 'View and show the server tags',
	subcommands: [
		{ name: 'show', chatInputRun: 'interactionShow', preconditions: ['GuildTextOnly'] },
		{ name: 'info', chatInputRun: 'interactionInfo', preconditions: ['GuildTextOnly'] },
		{
			name: 'config',
			type: 'group',
			entries: [
				{ name: 'add', messageRun: 'messageAdd', preconditions: ['ModeratorOnly', 'GuildTextOnly'] },
				{ name: 'remove', messageRun: 'messageRemove', preconditions: ['ModeratorOnly', 'GuildTextOnly'] },
				{ name: 'edit', messageRun: 'messageEdit', preconditions: ['ModeratorOnly', 'GuildTextOnly'] },
				{ name: 'raw', messageRun: 'messageRaw', preconditions: ['ModeratorOnly', 'GuildTextOnly'] }
			]
		}
	]
})
export class UserCommand extends Subcommand {
	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('show')
						.setDescription('View the server tags')
						.addStringOption((option) =>
							option.setName('name').setDescription('The name of the tag to show').setRequired(true).setAutocomplete(true)
						)
						.addUserOption((option) => option.setName('target').setDescription('The user to show the tag for').setRequired(false))
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('info')
						.setDescription('View info about a tag')
						.addStringOption((option) =>
							option.setName('name').setDescription('The name of the tag to show').setRequired(true).setAutocomplete(true)
						)
				)
				.setDMPermission(false)
		);
	}

	public async interactionShow(interaction: Subcommand.ChatInputCommandInteraction) {
		const tagName = interaction.options.getString('name', true);
		const user = interaction.options.getUser('target', false);

		const { tags } = await this.container.settings.guilds.get(interaction.guildId!);
		const tag = tags.find((tag) => tag.name === tagName);
		if (!tag) return interaction.reply({ content: `The tag ${inlineCode(tagName)} does not exist.`, ephemeral: true });
		tag.uses++;

		await this.container.settings.guilds.set(interaction.guildId!, { tags });

		return interaction.reply({
			content: [user ? `Tag suggestion for ${user}:` : '', tag.content].join('\n'),
			allowedMentions: { repliedUser: true, users: user ? [user.id] : [] }
		});
	}

	public async interactionInfo(interaction: Subcommand.ChatInputCommandInteraction) {
		const tagName = interaction.options.getString('name', true);

		const { tags } = await this.container.settings.guilds.get(interaction.guildId!);
		const tag = tags.find((tag) => tag.name === tagName);
		if (!tag) return interaction.reply({ content: `The tag ${inlineCode(tagName)} does not exist.`, ephemeral: true });

		const embed = new EmbedBuilder()
			.setTitle(tag.name)
			.addFields(
				{ name: 'Created At', value: time(Math.round(tag.createdAt / 1000), 'F'), inline: true },
				{ name: 'Created By', value: userMention(tag.author), inline: true },
				{ name: 'Uses', value: tag.uses.toString(), inline: true },
				{ name: 'Last Edited By', value: userMention(tag.lastEditedBy), inline: true },
				{ name: 'Last Edited At', value: time(Math.round(tag.updatedAt / 1000), 'F'), inline: true }
			);

		return interaction.reply({ embeds: [embed] });
	}

	public async messageAdd(message: Message, args: Args) {
		const tagName = await args.pick('string').catch(() => null);
		const tagContent = await args.rest('string').catch(() => null);

		if (!tagName) return reply(message, 'You must provide a tag name.');
		if (!tagContent) return reply(message, 'You must provide tag content.');

		const { tags } = await this.container.settings.guilds.get(message.guild!.id);
		const tag = tags.find((tag) => tag.name.toLowerCase() === tagName.toLowerCase());
		if (tag) return reply(message, `The tag ${inlineCode(tagName)} already exists.`);

		tags.push({
			uses: 0,
			name: tagName,
			content: tagContent,
			author: message.author.id,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			lastEditedBy: message.author.id
		});

		await this.container.settings.guilds.set(message.guildId!, { tags });
		return reply(message, `The tag ${inlineCode(tagName)} has been added.`);
	}

	public async messageRemove(message: Message, args: Args) {
		const tagName = await args.pick('string').catch(() => null);
		if (!tagName) return reply(message, 'You must provide a tag name.');

		const { tags } = await this.container.settings.guilds.get(message.guild!.id);
		const tagIndex = tags.findIndex((tag) => tag.name === tagName);
		if (tagIndex === -1) return reply(message, `The tag ${inlineCode(tagName)} does not exist.`);

		tags.splice(tagIndex, 1);
		await this.container.settings.guilds.set(message.guildId!, { tags });
		return reply(message, `The tag ${inlineCode(tagName)} has been removed.`);
	}

	public async messageEdit(message: Message, args: Args) {
		const tagName = await args.pick('string').catch(() => null);
		const tagContent = await args.rest('string').catch(() => null);

		if (!tagName) return reply(message, 'You must provide a tag name.');
		if (!tagContent) return reply(message, 'You must provide tag content.');

		const { tags } = await this.container.settings.guilds.get(message.guild!.id);
		const tag = tags.find((tag) => tag.name === tagName);
		if (!tag) return reply(message, `The tag ${inlineCode(tagName)} does not exist.`);

		tag.content = tagContent;
		tag.updatedAt = Date.now();
		tag.lastEditedBy = message.author.id;

		await this.container.settings.guilds.set(message.guildId!, { tags });
		return reply(message, `The tag ${inlineCode(tagName)} has been edited.`);
	}

	public async messageRaw(message: Message, args: Args) {
		const tagName = await args.pick('string').catch(() => null);
		if (!tagName) return reply(message, 'You must provide a tag name.');

		const { tags } = await this.container.settings.guilds.get(message.guild!.id);
		const tag = tags.find((tag) => tag.name.toLowerCase() === tagName.toLowerCase());
		if (!tag) return reply(message, `The tag ${inlineCode(tagName)} does not exist.`);

		return reply(message, codeBlock(tag.content));
	}

	public override async autocompleteRun(interaction: AutocompleteInteraction) {
		const { tags } = await this.container.settings.guilds.get(interaction.guildId!);
		if (!tags.length) return;
		const subcommand = interaction.options.getSubcommand(true);
		const option = interaction.options.getFocused(true);

		if (['show', 'info'].includes(subcommand) && option.name === 'name') {
			return interaction.respond(
				tags
					.filter((tag) => tag.name.toLowerCase().startsWith(option.value.toLowerCase()))
					.map((tag) => ({ name: `🏷️ ${tag.name}`, value: tag.name }))
			);
		}
	}
}
