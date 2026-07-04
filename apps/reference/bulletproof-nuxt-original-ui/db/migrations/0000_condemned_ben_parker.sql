CREATE TABLE `Comment` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`discussionId` text NOT NULL,
	`authorId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`discussionId`) REFERENCES `Discussion`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `Comment_discussionId_idx` ON `Comment` (`discussionId`);--> statement-breakpoint
CREATE INDEX `Comment_authorId_idx` ON `Comment` (`authorId`);--> statement-breakpoint
CREATE INDEX `Comment_createdAt_idx` ON `Comment` (`createdAt`);--> statement-breakpoint
CREATE TABLE `Discussion` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`authorId` text NOT NULL,
	`teamId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `Discussion_authorId_idx` ON `Discussion` (`authorId`);--> statement-breakpoint
CREATE INDEX `Discussion_teamId_idx` ON `Discussion` (`teamId`);--> statement-breakpoint
CREATE INDEX `Discussion_createdAt_idx` ON `Discussion` (`createdAt`);--> statement-breakpoint
CREATE TABLE `Team` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Team_name_unique` ON `Team` (`name`);--> statement-breakpoint
CREATE INDEX `Team_name_idx` ON `Team` (`name`);--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`bio` text,
	`password` text NOT NULL,
	`role` text DEFAULT 'USER' NOT NULL,
	`teamId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);--> statement-breakpoint
CREATE INDEX `User_email_idx` ON `User` (`email`);--> statement-breakpoint
CREATE INDEX `User_teamId_idx` ON `User` (`teamId`);