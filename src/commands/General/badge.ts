import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedBuilder, Message, inlineCode, time, userMention } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	name: 'badge',
	aliases: ['badges'],
	description: 'View information about a badge.',
	subcommands: [
		{ name: 'view', chatInputRun: 'interactionView', default: true },
		{
			name: 'config',
			type: 'group',
			entries: [
				{ name: 'give', messageRun: 'messageBadgeGive', preconditions: ['ModeratorOnly'] },
				{ name: 'take', messageRun: 'messageBadgeTake', preconditions: ['ModeratorOnly'] },
				{ name: 'add', messageRun: 'messageBadgeAdd', preconditions: ['ModeratorOnly'] },
				{ name: 'remove', messageRun: 'messageBadgeRemove', preconditions: ['ModeratorOnly'] },
				{ name: 'edit', messageRun: 'messageBadgeEdit', preconditions: ['ModeratorOnly'] },
				{ name: 'list', messageRun: 'messageBadgeList', preconditions: ['ModeratorOnly'] },
				{ name: 'assign', messageRun: 'messageBadgeAssign', preconditions: ['ModeratorOnly'] },
				{ name: 'members', messageRun: 'messageBadgeMembers', preconditions: ['ModeratorOnly'] }
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
						.setName('view')
						.setDescription('View information about a badge')
						.addStringOption((option) =>
							option.setName('badge').setDescription('The badge to view.').setAutocomplete(true).setRequired(true)
						)
				)
		);
	}

	public async interactionView(interaction: Subcommand.ChatInputCommandInteraction) {
		const badge = interaction.options.getString('badge', true);

		const { badges } = await this.container.settings.guilds.get(interaction.guildId!);
		if (!badges.length) return interaction.reply({ content: 'There are no badges in this server.', ephemeral: true });

		const targetBadge = badges.find((b) => b.name === badge);
		if (!targetBadge) return interaction.reply({ content: `There is no badge with the name ${badge}`, ephemeral: true });

		const allUsers = (await this.container.settings.users.getAll()).filter(
			(user) => user.settings.userBadges?.some((id) => id === targetBadge.id)
		);

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(targetBadge.name)
					.addFields([
						{ name: 'Description', value: targetBadge.description },
						{ name: 'Created At', value: time(Math.round(targetBadge.createdAt / 1000), 'F') }
					])
					.setFooter({ text: `This badge is awarded to ${allUsers.length} users.`, iconURL: interaction.guild?.iconURL()! })
			]
		});
	}

	public async messageBadgeGive(message: Message, args: Args) {
		const user = await args.pick('user');
		const badge = await args.rest('string');

		if (!user) return message.reply('You must provide a user.');
		if (!badge) return message.reply('You must provide a badge name or ID.');

		const { badges } = await this.container.settings.guilds.get(message.guildId!);
		const targetBadge = badges.find((b) => b.name === badge) ?? badges.find((b) => b.id === badge);
		if (!targetBadge) return message.reply(`There is no badge with the name or ID ${badge}.`);

		const { userBadges } = await this.container.settings.users.get(user.id);
		if (userBadges.some((id) => id === targetBadge.id)) return message.reply('That user already has that badge.');
		userBadges.push(targetBadge.id);

		await this.container.settings.users.set(user.id, { userBadges });
		return message.reply(`Successfully assigned the badge **${targetBadge.name}** to ${userMention(user.id)}.`);
	}

	public async messageBadgeTake(message: Message, args: Args) {
		const user = await args.pick('user');
		const badge = await args.rest('string');

		if (!user) return message.reply('You must provide a user.');
		if (!badge) return message.reply('You must provide a badge name or ID.');

		const { badges } = await this.container.settings.guilds.get(message.guildId!);
		const targetBadge = badges.find((b) => b.name === badge) ?? badges.find((b) => b.id === badge);
		if (!targetBadge) return message.reply(`There is no badge with the name or ID ${badge}.`);

		const { userBadges } = await this.container.settings.users.get(user.id);
		if (!userBadges.some((id) => id === targetBadge.id)) return message.reply('That user does not have that badge.');
		userBadges.splice(userBadges.indexOf(targetBadge.id), 1);

		await this.container.settings.users.set(user.id, { userBadges });
		return message.reply(`Successfully removed the badge **${targetBadge.name}** from ${userMention(user.id)}.`);
	}

	public async messageBadgeAdd(message: Message, args: Args) {
		const params = (await args.rest('string')).split('|');
		const [title, description] = [params.shift()!.trim(), params.join('|').trim()];
		if (!title) return message.reply('You must provide a title for the badge.');
		if (!description) return message.reply('You must provide a description for the badge.');

		const { badges } = await this.container.settings.guilds.get(message.guildId!);
		if (badges.some((badge) => badge.name === title)) return message.reply('A badge with that name already exists.');

		const now = Date.now();
		badges.push({
			id: now.toString(32),
			name: title,
			description,
			createdAt: now,
			updatedAt: now,
			createdBy: message.author.id
		});
		await this.container.settings.guilds.set(message.guildId!, { badges });
		return message.reply(`Successfully created the badge **${title}** with the ID ${inlineCode(now.toString(32))}.`);
	}

	public async messageBadgeRemove(message: Message, args: Args) {
		const badge = await args.rest('string');
		const { badges } = await this.container.settings.guilds.get(message.guildId!);
		// search by name or by id
		const targetBadge = badges.find((b) => b.name === badge) ?? badges.find((b) => b.id === badge);
		if (!targetBadge) return message.reply(`There is no badge with the name or ID ${badge}.`);

		// remove badge from all users
		const allUsers = (await this.container.settings.users.getAll()).filter((user) =>
			user.settings.userBadges.some((id) => id === targetBadge.id)
		);
		for (const user of allUsers) {
			const userSetting = user.settings;
			userSetting.userBadges = userSetting.userBadges.filter((id) => id !== targetBadge.id);
			await this.container.settings.users.set(user.id, userSetting);
		}

		badges.splice(badges.indexOf(targetBadge), 1);
		await this.container.settings.guilds.set(message.guildId!, { badges });
		return message.reply(`Successfully removed the badge **${targetBadge.name}** and to all ${allUsers.length} members.`);
	}

	public async messageBadgeEdit(message: Message, args: Args) {
		const badgeId = await args.pick('string').catch(() => null);
		const params = (await args.rest('string')).split('|');
		const [title, description] = [params.shift()!.trim(), params.join('|').trim()];

		if (!badgeId) return message.reply('You must provide a badge ID.');
		if (!title) return message.reply('You must provide a title for the badge.');
		if (!description) return message.reply('You must provide a description for the badge.');

		const { badges } = await this.container.settings.guilds.get(message.guildId!);
		const targetBadge = badges.find((b) => b.id === badgeId);
		if (!targetBadge) return message.reply(`There is no badge with ID ${badgeId}.`);

		targetBadge.name = title;
		targetBadge.description = description;
		targetBadge.updatedAt = Date.now();

		await this.container.settings.guilds.set(message.guildId!, { badges });
		return message.reply(`Successfully edited the badge **${targetBadge.name}**.`);
	}

	public async messageBadgeList(message: Message) {
		const { badges } = await this.container.settings.guilds.get(message.guildId!);
		if (!badges.length) return message.reply('There are no badges in this server.');

		const embed = new EmbedBuilder()
			.setTitle(`Badges for ${message.guild?.name}`)
			.setDescription(badges.map((badge) => `• ${badge.name} [${inlineCode(badge.id)}]`).join('\n'))
			.setColor('Random');
		return message.reply({ embeds: [embed] });
	}

	public async messageBadgeAssign(message: Message, args: Args) {
		const channel = (await args.pick('guildVoiceChannel')) ?? null;
		const badge = (await args.rest('string')) ?? null;

		if (!channel) return message.reply('You must provide a voice channel.');
		if (!badge) return message.reply('You must provide a badge name or ID.');

		const { badges } = await this.container.settings.guilds.get(message.guildId!);
		const targetBadge = badges.find((b) => b.name === badge) ?? badges.find((b) => b.id === badge);
		if (!targetBadge) return message.reply(`There is no badge with the name or ID ${badge}.`);

		const members = channel.members.filter((member) => !member.user.bot);
		if (!members.size) return message.reply(`There are no members in ${channel}.`);

		for (const member of members.values()) {
			const userSetting = await this.container.settings.users.get(member.id);
			// if the user already has the badge, return
			if (userSetting.userBadges.some((id) => id === targetBadge.id)) return;
			userSetting.userBadges.push(targetBadge.id);
			await this.container.settings.users.set(member.id, userSetting);
		}

		this.container.logger.info('Badge', `Assigned the badge ${targetBadge.name} to ${members.size} members.`);
		return message.reply(`Successfully assigned the badge **${targetBadge.name}** to ${members.size} members.`);
	}

	public async messageBadgeMembers(message: Message, args: Args) {
		const msg = await message.reply('Fetching members...');
		const badge = await args.rest('string');
		const { badges } = await this.container.settings.guilds.get(message.guildId!);
		const targetBadge = badges.find((b) => b.name === badge) ?? badges.find((b) => b.id === badge);
		if (!targetBadge) return message.reply(`There is no badge with the name or ID ${badge}.`);

		const guildMembers = await message.guild!.members.fetch();
		const usersWithBadge = (await this.container.settings.users.getAll()).filter(
			(user) => user.settings.userBadges && user.settings.userBadges.some((id) => id === targetBadge.id)
		);
		const members = usersWithBadge.map((user) => guildMembers.get(user.id)!);

		const embed = new EmbedBuilder()
			.setTitle(`Members with the "${targetBadge.name}" badge`)
			.setDescription(members.map((member) => `• ${member.user.tag}`).join('\n'))
			.setColor('Random');
		return msg.edit({ embeds: [embed], content: null });
	}

	public override async autocompleteRun(interaction: Subcommand.AutocompleteInteraction) {
		const { badges } = await this.container.settings.guilds.get(interaction.guildId!);
		if (!badges.length) return;
		interaction.respond(badges.map((badge) => ({ name: badge.name, value: badge.name })));
	}
}
