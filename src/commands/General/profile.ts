import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, bold, time } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: "View a user's profile.",
	requiredClientPermissions: ['EmbedLinks']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('user').setDescription('The user to view the profile of.').setRequired(false))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const member = await interaction.guild?.members.fetch(user.id);

		const { userBadges, globalBadges } = await this.container.settings.getUserSetting(user.id);
		const badges = (
			await Promise.all(
				userBadges.map(async (id) => {
					const badge = (await this.container.settings.getGuildSetting(interaction.guildId!)).badges.find((badge) => badge.id === id);
					// delete badge if it doesn't exist anymore
					if (!badge) await this.container.settings.setUserSetting(user.id, { userBadges: userBadges.filter((badgeId) => badgeId !== id) });
					return badge;
				})
			)
		).sort((a, b) => b!.createdAt - a!.createdAt);

		const embed = new EmbedBuilder()
			.setColor('#739072')
			.setTitle(`${user.username}'s Profile`)
			.setThumbnail(user.displayAvatarURL({ size: 2048, extension: 'webp' }))
			.addFields([
				{ name: 'Created at', value: `${time(user.createdAt, 'f')} (${time(user.createdAt, 'R')})`, inline: true },
				{
					name: 'Joined at',
					value: member?.joinedAt ? `${time(member?.joinedAt!, 'f')} (${time(member.joinedAt, 'R')})` : 'Unknown',
					inline: true
				},
				{
					name: 'Badges',
					value:
						globalBadges.length || badges.length
							? [
									globalBadges.length ? globalBadges.map((badge) => `➥ ${bold(badge!.name)}`).join('\n') : '',
									badges.length ? badges.map((badge) => `➥ ${bold(badge!.name)}`).join('\n') : ''
							  ].join('\n')
							: 'This user has no badges.'
				}
			])
			.setFooter({
				text: `Requested by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL({ size: 128, extension: 'webp' })
			});

		return interaction.reply({ embeds: [embed] });
	}
}
