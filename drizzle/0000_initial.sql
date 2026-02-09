CREATE TABLE `attendances` (
	`id` text PRIMARY KEY NOT NULL,
	`student` text NOT NULL,
	`time` text NOT NULL,
	`type` text NOT NULL,
	`day` text GENERATED ALWAYS AS (date(datetime("time", '+7 hours'))) VIRTUAL,
	`pict` blob,
	FOREIGN KEY (`student`) REFERENCES `students`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendance_unique_per_day` ON `attendances` (`student`,`type`,`day`);--> statement-breakpoint
CREATE INDEX `attendance_day_index` ON `attendances` (`day`);--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`room` text NOT NULL
);
