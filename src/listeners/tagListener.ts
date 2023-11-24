import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { ChannelType, Message } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.MessageCreate
})
export class UserEvent extends Listener {
	public async run(message: Message) {
		if (message.author.bot) return;
		if (message.channel.type === ChannelType.DM) return;

		let tag = '';

		const prefix = this.container.client.fetchPrefix(message) as string;

		if (message.content.startsWith(prefix)) tag = message.content.slice(prefix.length).split(' ')[0];
		else if (this.container.client.options.regexPrefix!.test(message.content))
			tag = message.content.replace(this.container.client.options.regexPrefix!, '').trim().split(' ')[0];

		const { tags } = await this.container.settings.guilds.get(message.guildId!);
		const resolvedTag = tags.find((t) => t.name.toLowerCase() === tag.toLowerCase()) ?? null;
		if (!resolvedTag) return;

		resolvedTag.uses++;
		await this.container.settings.guilds.set(message.guildId!, { tags });

		return message.reply({ content: resolvedTag.content, allowedMentions: { repliedUser: true, parse: [] } });
	}
}
