export const defaultGuildSettings: GuildSettings = {
	tags: [],
	badges: [],
	suggestions: []
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
	suggestions: Suggestion[];
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

interface Suggestion {
	id: number;
	content: string;
	author: string;
	createdAt: number;
}
