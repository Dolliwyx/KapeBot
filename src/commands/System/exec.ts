import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Stopwatch } from '@sapphire/stopwatch';
import { codeBlock } from '@sapphire/utilities';
import { exec } from 'child_process';
import type { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Executes shell commands. Use with caution.',
	preconditions: ['OwnerOnly']
})
export class UserCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const stopwatch = new Stopwatch();
		// Run a shell command using exec
		exec(await args.rest('string'), (error, stdout, stderr) => {
			// If there was an error, log it in the console
			if (error) {
				this.container.client.logger.error(error);
				return send(message, { content: `**ERROR** (\`⏰ ${stopwatch.stop()}\`)${codeBlock('bash', stderr ?? error.message)}` });
			}
			// Send the output of the command
			return send(message, { content: `**OUTPUT** (\`⏰ ${stopwatch.stop()}\`)${codeBlock('bash', stdout)}` });
		});
	}
}
