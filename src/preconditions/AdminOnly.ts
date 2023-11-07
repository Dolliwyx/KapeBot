import { Precondition } from '@sapphire/framework';
import { envParseArray } from '@skyra/env-utilities';
import type { Interaction, Message, PermissionsBitField } from 'discord.js';

export class UserPrecondition extends Precondition {
	public override chatInputRun(interaction: Interaction) {
		if (
			!envParseArray('OWNERS').includes(interaction.user.id) &&
			!(interaction.member?.permissions as PermissionsBitField).toArray().some((perms) => perms.includes('Administrator'))
		) {
			return this.error({ message: 'You must be an administrator to use this command.', identifier: 'PermissionsMissing' });
		}
		return this.ok();
	}

	public override messageRun(message: Message) {
		if (
			!envParseArray('OWNERS').includes(message.author.id) &&
			!message.member?.permissions.toArray().some((perms) => perms.includes('Administrator'))
		) {
			return this.error({ message: 'You must be an administrator to use this command.', identifier: 'PermissionsMissing' });
		}
		return this.ok();
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		AdminOnly: never;
	}
}
