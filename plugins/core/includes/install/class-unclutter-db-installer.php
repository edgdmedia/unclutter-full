<?php
/**
 * Unclutter DB Installer
 * Handles creation and updates of all custom tables for the core plugin.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_DB_Installer {
    public static function install() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $prefix = $wpdb->prefix . 'unclutter_';

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        // Profiles Table (profile fields only)
        $sql_profiles = "CREATE TABLE {$prefix}profiles (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            display_name VARCHAR(150),
            email VARCHAR(191),
            phone VARCHAR(30),
            bio TEXT,
            avatar_url VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY wp_user_id (wp_user_id)
        ) $charset_collate;";

        // Usermeta Table (all meta/auth data)
        $sql_usermeta = "CREATE TABLE {$prefix}usermeta (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            profile_id BIGINT UNSIGNED NOT NULL,
            meta_key VARCHAR(191) NOT NULL,
            meta_value LONGTEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY profile_id (profile_id),
            KEY meta_key (meta_key),
            FOREIGN KEY (profile_id) REFERENCES {$prefix}profiles(id) ON DELETE CASCADE
        ) $charset_collate;";
        // Roles Table
        $sql_roles = "CREATE TABLE {$prefix}roles (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(50) NOT NULL,
            description VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY name (name)
        ) $charset_collate;";

        // Profile Roles Table (Many-to-Many)
        $sql_profile_roles = "CREATE TABLE {$prefix}profile_roles (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            profile_id BIGINT UNSIGNED NOT NULL,
            role_id BIGINT UNSIGNED NOT NULL,
            assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY profile_id (profile_id),
            KEY role_id (role_id)
        ) $charset_collate;";

        // Subscriptions Table
        $sql_subscriptions = "CREATE TABLE {$prefix}subscriptions (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            profile_id BIGINT UNSIGNED NOT NULL,
            status VARCHAR(30) NOT NULL,
            start_date DATETIME,
            end_date DATETIME,
            meta JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY profile_id (profile_id)
        ) $charset_collate;";

        // Subscription Features Table
        $sql_subscription_features = "CREATE TABLE {$prefix}subscription_features (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            subscription_id BIGINT UNSIGNED NOT NULL,
            feature VARCHAR(100) NOT NULL,
            tier VARCHAR(50),
            meta JSON,
            PRIMARY KEY (id),
            KEY subscription_id (subscription_id)
        ) $charset_collate;";

        // Rate Limits Table
        $sql_rate_limits = "CREATE TABLE {$prefix}rate_limits (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            profile_id BIGINT UNSIGNED NOT NULL,
            endpoint VARCHAR(255) NOT NULL,
            count INT UNSIGNED NOT NULL DEFAULT 0,
            last_request DATETIME,
            PRIMARY KEY (id),
            KEY profile_id (profile_id)
        ) $charset_collate;";

        // Error Logs Table
        $sql_error_logs = "CREATE TABLE {$prefix}error_logs (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            profile_id BIGINT UNSIGNED,
            endpoint VARCHAR(255),
            error_message TEXT,
            error_code VARCHAR(50),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY profile_id (profile_id)
        ) $charset_collate;";

        // Audit Logs Table
        $sql_audit_logs = "CREATE TABLE {$prefix}audit_logs (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            profile_id BIGINT UNSIGNED,
            action VARCHAR(100),
            details JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY profile_id (profile_id)
        ) $charset_collate;";

        // Notifications Table
        $sql_notifications = "CREATE TABLE {$prefix}notifications (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            profile_id BIGINT UNSIGNED NOT NULL,
            type VARCHAR(50),
            content TEXT,
            is_read TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY profile_id (profile_id)
        ) $charset_collate;";

        dbDelta($sql_profiles);
        dbDelta($sql_usermeta);
        dbDelta($sql_roles);
        dbDelta($sql_profile_roles);
        dbDelta($sql_subscriptions);
        dbDelta($sql_subscription_features);
        dbDelta($sql_rate_limits);
        dbDelta($sql_error_logs);
        dbDelta($sql_audit_logs);
        dbDelta($sql_notifications);
    }
}
