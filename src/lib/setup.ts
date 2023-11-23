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
import { srcDir } from '#lib/constants';
import { Setting } from './structures/Setting';
import { User } from './schemas/User';
import { Guild } from './schemas';

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Read env var
setup({ path: new URL('.env', srcDir) });

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
colorette.createColors({ useColor: true });

const dbUrl = `postgres://${process.env.POSTGRES_USERNAME}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`

container.logger.info('Readying database...');
container.settings.users = new Setting('userSettings', 'postgres', new URL(dbUrl), User);
container.settings.guilds = new Setting('guildSettings', 'postgres', new URL(dbUrl), Guild);
