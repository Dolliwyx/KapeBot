export const defaultGuildSettings: GuildSettings = {
	tags: [],
	badges: []
};

export const defaultUserSettings: UserSettings = {
	globalBadges: [],
	userBadges: []
};

export interface UserSettings {
	globalBadges: Badge[];
	userBadges: Badge['id'][];
}

export interface GuildSettings {
	tags: Tag[];
	badges: Badge[];
}

interface Tag {
	name: string;
	content: string;
	author: string;
	createdAt: number;
	updatedAt: number;
}

interface Badge {
	id: string;
	name: string;
	description: string;
	updatedAt: number;
	createdAt: number;
	createdBy: string;
}
