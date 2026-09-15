CREATE TABLE `user_sync_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`payload` mediumtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_sync_snapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_sync_snapshots_userId_unique` UNIQUE(`userId`)
);
