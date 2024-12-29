import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const NotificationType = {
	WARNING: "WARNING",
	INFO: "INFO",
} as const;
export type NotificationType =
	(typeof NotificationType)[keyof typeof NotificationType];
export type CommentLike = {
	commentId: string;
	userId: string;
	createdAt: Generated<Timestamp>;
};
export type Comments = {
	id: Generated<string>;
	content: string;
	userId: string;
	kweekId: string | null;
	attachments: string[];
	createdAt: Generated<Timestamp>;
	updatedAt: Generated<Timestamp>;
	parentId: string | null;
};
export type Follows = {
	followerId: string;
	followingId: string;
};
export type Kweek = {
	id: Generated<string>;
	content: string;
	authorId: string;
	attachments: string[];
	createdAt: Generated<Timestamp>;
	updatedAt: Timestamp;
};
export type KweekLike = {
	kweekId: string;
	userId: string;
	createdAt: Generated<Timestamp>;
};
export type Notifications = {
	id: Generated<string>;
	type: NotificationType;
	content: string;
	createdAt: Generated<Timestamp>;
	fromUserId: string;
	toUserId: string;
};
export type RefreshToken = {
	id: Generated<string>;
	token: string;
	userId: string;
	expiryDate: Timestamp;
};
export type User = {
	id: Generated<string>;
	displayName: string | null;
	username: string;
	email: string;
	password: string;
	profileImage: string | null;
	socketId: string | null;
	createdAt: Generated<Timestamp>;
};
export type DB = {
	CommentLike: CommentLike;
	Comments: Comments;
	Follows: Follows;
	Kweek: Kweek;
	KweekLike: KweekLike;
	Notifications: Notifications;
	RefreshToken: RefreshToken;
	User: User;
};
