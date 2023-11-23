import { mergeDefault } from '@sapphire/utilities';
import Keyv from 'keyv';

export class Setting<T extends object> {
	name: string;
	adapter: 'redis' | 'mongodb' | 'mongo' | 'sqlite' | 'postgresql' | 'postgres' | 'mysql';
	url: URL;
	driver!: Keyv;
	defaultSettings: T;

	public constructor(
		name: string,
		adapter: 'redis' | 'mongodb' | 'mongo' | 'sqlite' | 'postgresql' | 'postgres' | 'mysql',
		url: URL,
		defaultSettings: T
	) {
		this.name = name;
		this.adapter = adapter;
		this.url = url;
		this.driver;
		this.defaultSettings = defaultSettings;

		this.init();
	}

	public init() {
		this.driver = new Keyv(this.url.protocol === 'file:' ? this.url.pathname : this.url.href, { namespace: this.name, adapter: this.adapter });
		this.driver.on('error', (error) => console.error(error));
	}

	public async create(id: string): Promise<T> {
		await this.driver.set(id, {});
		return this.defaultSettings;
	}

	public async get(id: string): Promise<T> {
		const settings = (await this.driver.get(id)) ?? (await this.create(id));
		return mergeDefault(this.defaultSettings, settings);
	}

	public async set(id: string, data: Partial<T>): Promise<T> {
		if (typeof data !== 'object') throw new Error('Data must be an object');
		const settings = (await this.driver.get(id)) ?? (await this.create(id));
		const updatedSettings = mergeDefault(settings, data);
		await this.driver.set(id, updatedSettings);
		return mergeDefault(this.defaultSettings, updatedSettings);
	}

	public async reset(id: string): Promise<T> {
		await this.set(id, this.defaultSettings);
		return this.defaultSettings;
	}

	public async delete(id: string) {
		return this.driver.delete(id);
	}

    async _disconnect() {
        return this.driver.disconnect();
    }
}
