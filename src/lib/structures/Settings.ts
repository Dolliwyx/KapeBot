import { mergeDefault } from '@sapphire/utilities';
import { GuildSettings, UserSettings, defaultGuildSettings, defaultUserSettings } from '#lib/common/defaultSettings';
import Keyv from 'keyv';
import { container } from '@sapphire/framework';

export class Settings {
	private path: URL;
	private userSettings!: Keyv;
	private guildSettings!: Keyv;

	public constructor(path: URL) {
		this.path = path;
		this.userSettings;
		this.guildSettings;
	}

	public init() {
		this.userSettings = new Keyv(this.path.pathname, { namespace: 'userSettings', adapter: 'sqlite' });
		this.guildSettings = new Keyv(this.path.pathname, { namespace: 'guildSettings', adapter: 'sqlite' });

		this.userSettings.on('error', (error) => container.logger.error(error));
		this.guildSettings.on('error', (error) => container.logger.error(error));
	}

	public async createGuildSetting(guildId: string): Promise<GuildSettings> {
		await this.guildSettings.set(guildId, {});
		return defaultGuildSettings;
	}

	public async createUserSetting(userId: string): Promise<UserSettings> {
		await this.userSettings.set(userId, {});
		return defaultUserSettings;
	}

	public async getGuildSetting(guildId: string): Promise<GuildSettings> {
		const guildSettings = (await this.guildSettings.get(guildId)) ?? (await this.createGuildSetting(guildId));
		return mergeDefault(defaultGuildSettings, guildSettings);
	}

	public async setGuildSetting(guildId: string, data: Partial<GuildSettings> = {}): Promise<GuildSettings> {
		if (typeof data !== 'object') throw new Error('Data must be an object');
		const guildSettings = (await this.guildSettings.get(guildId)) ?? (await this.createGuildSetting(guildId));
		const updatedSettings = mergeDefault(guildSettings, data);
		await this.guildSettings.set(guildId, updatedSettings);
		return mergeDefault(defaultGuildSettings, updatedSettings);
	}

	public async getUserSetting(userId: string): Promise<UserSettings> {
		const userSettings = (await this.userSettings.get(userId)) ?? (await this.createUserSetting(userId));
		return mergeDefault(defaultUserSettings, userSettings);
	}

	public async setUserSetting(userId: string, data: Partial<UserSettings> = {}): Promise<UserSettings> {
		if (typeof data !== 'object') throw new Error('Data must be an object');
		const userSettings = (await this.userSettings.get(userId)) ?? (await this.createUserSetting(userId));
		const updatedSettings = mergeDefault(userSettings, data);
		this.userSettings.set(userId, updatedSettings);
		return mergeDefault(defaultUserSettings, updatedSettings);
	}

	public async resetGuildSetting(guildId: string) {
		return this.guildSettings.set(guildId, {});
	}

	public async resetUserSetting(userId: string) {
		return this.userSettings.set(userId, {});
	}

	public async deleteGuildSetting(guildId: string) {
		return this.guildSettings.delete(guildId);
	}

	public async deleteUserSetting(userId: string) {
		return this.userSettings.delete(userId);
	}

	public async getAllGuildSettings(): Promise<{ id: string; settings: GuildSettings }[]> {
		const arr = [];
		for await (const [id, _] of this.guildSettings.iterator()) {
			const settings = await this.getGuildSetting(id);
			arr.push({ id, settings });
		}
		return arr;
	}

	public async getAllUserSettings(): Promise<{ id: string; settings: UserSettings }[]> {
		const arr = [];
		for await (const [id, _] of this.userSettings.iterator()) {
			const settings = await this.getUserSetting(id);
			arr.push({ id, settings });
		}
		return arr;
	}

	public async _disconnect() {
		await this.userSettings.disconnect();
		await this.guildSettings.disconnect();
	}
}
