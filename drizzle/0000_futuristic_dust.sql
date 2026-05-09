CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`uri` text NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` integer NOT NULL
);
