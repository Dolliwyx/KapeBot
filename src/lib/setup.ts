// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { ApplicationCommandRegistries, RegisterBehavior, container } from '@sapphire/framework';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-subcommands/register';
import { setup } from '@skyra/env-utilities';
import * as colorette from 'colorette';
import { inspect } from 'util';
import { rootDir, srcDir } from '#lib/constants';
import { Settings } from '#lib/structures/Settings';

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Read env var
setup({ path: new URL('.env', srcDir) });

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
colorette.createColors({ useColor: true });

container.settings = new Settings(new URL(process.env.DATABASE_URL, rootDir));
