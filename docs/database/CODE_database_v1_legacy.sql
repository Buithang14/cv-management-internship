CREATE TABLE `departments` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `code` varchar(20) UNIQUE NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `username` varchar(50) UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) UNIQUE NOT NULL,
  `role` ENUM ('HR', 'TECH_LEAD', 'MANAGER', 'EMPLOYEE') NOT NULL,
  `is_active` boolean DEFAULT true,
  `created_at` datetime DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `cvs` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `version` int DEFAULT 1,
  `status` ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELED') NOT NULL DEFAULT (DRAFT),
  `full_name` varchar(100),
  `avatar_url` varchar(255),
  `phone` varchar(20),
  `summary` text,
  `objective` text,
  `experiences_json` text,
  `educations_json` text,
  `skills_json` text,
  `created_at` datetime DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `cv_update_requests` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `requested_by` int NOT NULL,
  `target_user_id` int NOT NULL,
  `deadline` datetime NOT NULL,
  `batch_name` varchar(100),
  `status` ENUM ('PENDING', 'COMPLETED', 'CANCELED') DEFAULT (PENDING),
  `created_at` datetime DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `cv_approval_logs` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `cv_id` int NOT NULL,
  `approver_id` int NOT NULL,
  `action` ENUM ('APPROVED', 'REJECTED') NOT NULL,
  `comment` text,
  `created_at` datetime DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `notifications` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `is_read` boolean DEFAULT false,
  `created_at` datetime DEFAULT (CURRENT_TIMESTAMP)
);

ALTER TABLE `users` ADD FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

ALTER TABLE `cvs` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `cv_update_requests` ADD FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`);

ALTER TABLE `cv_update_requests` ADD FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`);

ALTER TABLE `cv_approval_logs` ADD FOREIGN KEY (`cv_id`) REFERENCES `cvs` (`id`);

ALTER TABLE `cv_approval_logs` ADD FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`);

ALTER TABLE `notifications` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
