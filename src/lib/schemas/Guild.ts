export const Guild: GuildSchema = {
	tags: [],
	badges: [],
	suggestions: []
};

export type GuildSchema = {
	tags: Tag[];
	badges: Badge[];
	suggestions: Suggestion[];
};

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
