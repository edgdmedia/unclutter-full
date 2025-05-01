<?php
/**
 * Unclutter Therapy DB Installer
 * Handles creation and updates of all custom tables for the therapy plugin.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_Therapy_DB_Installer {
    public static function install() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $prefix = $wpdb->prefix . 'unclutter_therapy_';

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        // Therapists Table
        $sql_therapists = "CREATE TABLE {$prefix}therapists (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            org_id BIGINT UNSIGNED,
            profile_id BIGINT UNSIGNED NOT NULL,
            bio TEXT,
            specialties VARCHAR(255),
            is_active TINYINT(1) DEFAULT 1,
            calendar_link VARCHAR(255),
            meta JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";

        // Sessions Table
        $sql_sessions = "CREATE TABLE {$prefix}sessions (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            therapist_id BIGINT UNSIGNED NOT NULL,
            client_id BIGINT UNSIGNED NOT NULL,
            package_id BIGINT UNSIGNED,
            start_time DATETIME,
            end_time DATETIME,
            status VARCHAR(20),
            type VARCHAR(30),
            notes TEXT,
            shared_notes TEXT,
            coupon_id BIGINT UNSIGNED,
            meta JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";

        // Bookings Table
        $sql_bookings = "CREATE TABLE {$prefix}bookings (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            session_id BIGINT UNSIGNED NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(20),
            form_status VARCHAR(20),
            meta JSON,
            PRIMARY KEY (id)
        ) $charset_collate;";

        // Forms Table
        $sql_forms = "CREATE TABLE {$prefix}forms (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            org_id BIGINT UNSIGNED,
            type VARCHAR(20),
            title VARCHAR(100),
            fields JSON,
            meta JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";

        // Form Responses Table
        $sql_form_responses = "CREATE TABLE {$prefix}form_responses (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            form_id BIGINT UNSIGNED NOT NULL,
            booking_id BIGINT UNSIGNED NOT NULL,
            client_id BIGINT UNSIGNED NOT NULL,
            responses JSON,
            submitted_at DATETIME,
            PRIMARY KEY (id)
        ) $charset_collate;";

        // Packages Table
        $sql_packages = "CREATE TABLE {$prefix}packages (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            org_id BIGINT UNSIGNED,
            title VARCHAR(100),
            description TEXT,
            sessions INT,
            price DECIMAL(10,2),
            duration VARCHAR(20),
            meta JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";

        // Coupons Table
        $sql_coupons = "CREATE TABLE {$prefix}coupons (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            org_id BIGINT UNSIGNED,
            code VARCHAR(30),
            discount_type VARCHAR(10),
            value DECIMAL(10,2),
            valid_from DATETIME,
            valid_to DATETIME,
            usage_limit INT,
            meta JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";

        // Resources Table
        $sql_resources = "CREATE TABLE {$prefix}resources (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            org_id BIGINT UNSIGNED,
            therapist_id BIGINT UNSIGNED,
            title VARCHAR(100),
            type VARCHAR(30),
            url VARCHAR(255),
            assigned_to BIGINT UNSIGNED,
            meta JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";

        // Community Notes Table
        $sql_community = "CREATE TABLE {$prefix}community (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            entry_id BIGINT UNSIGNED NOT NULL,
            profile_id BIGINT UNSIGNED,
            is_anonymous TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            meta JSON,
            PRIMARY KEY (id)
        ) $charset_collate;";

        // Comments Table
        $sql_comments = "CREATE TABLE {$prefix}comments (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            entry_id BIGINT UNSIGNED NOT NULL,
            profile_id BIGINT UNSIGNED,
            content TEXT,
            is_anonymous TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            meta JSON,
            PRIMARY KEY (id)
        ) $charset_collate;";

        // Reactions Table
        $sql_reactions = "CREATE TABLE {$prefix}reactions (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            entry_id BIGINT UNSIGNED NOT NULL,
            profile_id BIGINT UNSIGNED,
            type VARCHAR(30),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            meta JSON,
            PRIMARY KEY (id)
        ) $charset_collate;";

        dbDelta($sql_therapists);
        dbDelta($sql_sessions);
        dbDelta($sql_bookings);
        dbDelta($sql_forms);
        dbDelta($sql_form_responses);
        dbDelta($sql_packages);
        dbDelta($sql_coupons);
        dbDelta($sql_resources);
        dbDelta($sql_community);
        dbDelta($sql_comments);
        dbDelta($sql_reactions);
    }
}
