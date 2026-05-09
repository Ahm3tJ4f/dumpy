PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`uri` text NOT NULL,
	`sort_order` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_photos`("id", "created_at", "uri", "sort_order") SELECT "id", "created_at", "uri", "sort_order" FROM `photos`;--> statement-breakpoint
DROP TABLE `photos`;--> statement-breakpoint
ALTER TABLE `__new_photos` RENAME TO `photos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;