import { ApplyOptions } from '@sapphire/decorators';
import { Command, type Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Stopwatch } from '@sapphire/stopwatch';
import { Type } from '@sapphire/type';
import { codeBlock, isThenable } from '@sapphire/utilities';
import { bold, inlineCode, type Message } from 'discord.js';
import { inspect } from 'util';

@ApplyOptions<Command.Options>({
	aliases: ['ev'],
	description: 'Evals any JavaScript code',
	quotes: [],
	preconditions: ['OwnerOnly'],
	flags: ['async', 'hidden', 'showHidden', 'silent', 's'],
	options: ['depth']
})
export class UserCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const stopwatch = new Stopwatch();
		const code = await args.rest('string');

		const { result, success, type } = await this.eval(message, code, {
			async: args.getFlags('async'),
			depth: Number(args.getOption('depth')) ?? 0,
			showHidden: args.getFlags('hidden', 'showHidden')
		});

		const output = success ? codeBlock('js', result) : `${bold('ERROR')} ${codeBlock('bash', result)}`;
		if (args.getFlags('silent', 's')) return null;

		const evalHeader = inlineCode(`⏰ ${stopwatch.toString()} | ${type}`);

		if (output.length > 2000) {
			return send(message, {
				content: `Output was too long... sent the result as a file.\n\n${evalHeader}`,
				files: [{ attachment: Buffer.from(output), name: 'output.js' }]
			});
		}

		return send(message, `${evalHeader}\n${output}`);
	}

	private async eval(message: Message, code: string, flags: { async: boolean; depth: number; showHidden: boolean }) {
		if (flags.async) code = `(async () => {\n${code}\n})();`;

		// @ts-expect-error value is never read, this is so `msg` is possible as an alias when sending the eval.
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const msg = message;
		let success = true;
		let result = null;

		try {
			// eslint-disable-next-line no-eval
			result = eval(code);
		} catch (error) {
			if (error && error instanceof Error && error.stack) {
				this.container.client.logger.error(error);
			}
			result = error;
			success = false;
		}

		const type = new Type(result).toString();
		if (isThenable(result)) result = await result;

		if (typeof result !== 'string') {
			result = inspect(result, {
				depth: flags.depth,
				showHidden: flags.showHidden
			});
		}

		return { result, success, type };
	}
}
