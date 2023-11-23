export const User: UserSchema = {
	globalBadges: [],
	userBadges: []
};

export interface UserSchema {
	globalBadges: Badge[];
	userBadges: Badge['id'][];
}

interface Badge {
	id: string;
	name: string;
	description: string;
	updatedAt: number;
	createdAt: number;
	createdBy: string;
}