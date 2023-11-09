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
	id: string;
	description: string;
	name: string;
	createdAt: number;
	createdBy: string;
}
