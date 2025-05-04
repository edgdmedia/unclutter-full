<?php
if (!defined('ABSPATH')) exit;

/**
 * Database updater for the Unclutter Finance plugin
 * 
 * Handles database updates for the finance plugin
 */
class Unclutter_Finance_DB_Updater {
    /**
     * Run database updates
     */
    public static function update() {
        self::add_destination_account_column();
    }
    
    /**
     * Add destination_account_id column to transactions table if it doesn't exist
     */
    private static function add_destination_account_column() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'unclutter_finance_transactions';
        
        // Check if the column already exists
        $column_exists = $wpdb->get_results("SHOW COLUMNS FROM {$table_name} LIKE 'destination_account_id'");
        
        if (empty($column_exists)) {
            // Add the column
            $wpdb->query("ALTER TABLE {$table_name} ADD COLUMN destination_account_id BIGINT UNSIGNED NULL AFTER category_id");
        }
    }
}
