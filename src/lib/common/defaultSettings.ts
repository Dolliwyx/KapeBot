export const defaultGuildSettings: GuildSettings = {
	tags: [],
	badges: []
};

export const defaultUserSettings: UserSettings = {
	userBadges: []
};

export interface UserSettings {
	userBadges: Badge[];
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
	name: string;
	description: string;
	createdAt: number;
	createdBy: string;
}
