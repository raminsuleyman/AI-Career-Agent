CREATE TABLE `analyses` (
	`id` varchar(36) NOT NULL,
	`user_id` int NOT NULL,
	`cv_id` varchar(36) NOT NULL,
	`request_key` varchar(64) NOT NULL,
	`target_role` enum('frontend','backend','fullstack','data','qa','ux') NOT NULL,
	`candidate_level` enum('student','junior','unknown') NOT NULL DEFAULT 'unknown',
	`summary` varchar(500) NOT NULL,
	`skills` json NOT NULL,
	`highlights` json NOT NULL,
	`role_readiness` int NOT NULL,
	`source` enum('real','mock') NOT NULL DEFAULT 'mock',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`),
	CONSTRAINT `analyses_user_request_unique` UNIQUE(`user_id`,`request_key`)
);
--> statement-breakpoint
CREATE TABLE `cv_documents` (
	`id` varchar(36) NOT NULL,
	`user_id` int NOT NULL,
	`source` enum('paste','file_text') NOT NULL DEFAULT 'paste',
	`text` longtext NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cv_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interview_answers` (
	`id` varchar(36) NOT NULL,
	`interview_id` varchar(36) NOT NULL,
	`question_id` varchar(36) NOT NULL,
	`answer` longtext,
	`skipped` boolean NOT NULL DEFAULT false,
	`score` int,
	`strength` varchar(160),
	`improvement` varchar(160),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interview_answers_id` PRIMARY KEY(`id`),
	CONSTRAINT `interview_answers_question_unique` UNIQUE(`question_id`)
);
--> statement-breakpoint
CREATE TABLE `interview_questions` (
	`id` varchar(36) NOT NULL,
	`interview_id` varchar(36) NOT NULL,
	`position` int NOT NULL,
	`type` enum('technical','experience','behavioral','scenario') NOT NULL,
	`skill_slug` varchar(48),
	`question` varchar(300) NOT NULL,
	`rubric` varchar(400),
	CONSTRAINT `interview_questions_id` PRIMARY KEY(`id`),
	CONSTRAINT `interview_questions_position_unique` UNIQUE(`interview_id`,`position`)
);
--> statement-breakpoint
CREATE TABLE `interviews` (
	`id` varchar(36) NOT NULL,
	`user_id` int NOT NULL,
	`analysis_id` varchar(36) NOT NULL,
	`target_role` enum('frontend','backend','fullstack','data','qa','ux') NOT NULL,
	`status` enum('in_progress','completed') NOT NULL DEFAULT 'in_progress',
	`source` enum('real','mock') NOT NULL DEFAULT 'mock',
	`interview_score` int,
	`readiness_score` int,
	`feedback` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `interviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_tasks` (
	`id` varchar(36) NOT NULL,
	`roadmap_id` varchar(36) NOT NULL,
	`day` int NOT NULL,
	`position` int NOT NULL,
	`skill_slug` varchar(48) NOT NULL,
	`title` varchar(140) NOT NULL,
	`description` varchar(400) NOT NULL,
	`est_minutes` int NOT NULL,
	`resource_query` varchar(120) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`completed_at` timestamp,
	CONSTRAINT `roadmap_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmaps` (
	`id` varchar(36) NOT NULL,
	`user_id` int NOT NULL,
	`analysis_id` varchar(36) NOT NULL,
	`target_role` enum('frontend','backend','fullstack','data','qa','ux') NOT NULL,
	`source` enum('real','mock') NOT NULL DEFAULT 'mock',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roadmaps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analyses` ADD CONSTRAINT `analyses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analyses` ADD CONSTRAINT `analyses_cv_id_cv_documents_id_fk` FOREIGN KEY (`cv_id`) REFERENCES `cv_documents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cv_documents` ADD CONSTRAINT `cv_documents_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interview_answers` ADD CONSTRAINT `interview_answers_interview_id_interviews_id_fk` FOREIGN KEY (`interview_id`) REFERENCES `interviews`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interview_answers` ADD CONSTRAINT `interview_answers_question_id_interview_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `interview_questions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interview_questions` ADD CONSTRAINT `interview_questions_interview_id_interviews_id_fk` FOREIGN KEY (`interview_id`) REFERENCES `interviews`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interviews` ADD CONSTRAINT `interviews_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interviews` ADD CONSTRAINT `interviews_analysis_id_analyses_id_fk` FOREIGN KEY (`analysis_id`) REFERENCES `analyses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roadmap_tasks` ADD CONSTRAINT `roadmap_tasks_roadmap_id_roadmaps_id_fk` FOREIGN KEY (`roadmap_id`) REFERENCES `roadmaps`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roadmaps` ADD CONSTRAINT `roadmaps_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roadmaps` ADD CONSTRAINT `roadmaps_analysis_id_analyses_id_fk` FOREIGN KEY (`analysis_id`) REFERENCES `analyses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `analyses_user_created_idx` ON `analyses` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `cv_documents_user_created_idx` ON `cv_documents` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `interviews_user_created_idx` ON `interviews` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `roadmap_tasks_roadmap_day_idx` ON `roadmap_tasks` (`roadmap_id`,`day`);--> statement-breakpoint
CREATE INDEX `roadmaps_user_created_idx` ON `roadmaps` (`user_id`,`created_at`);