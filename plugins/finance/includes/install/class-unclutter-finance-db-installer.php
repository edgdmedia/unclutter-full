<?php
if (!defined('ABSPATH')) exit;

/**
 * Database installer for the Unclutter Finance plugin
 * 
 * Creates all required tables for the finance plugin
 */
class Unclutter_Finance_DB_Installer {
    /**
     * Install the database tables
     */
    public static function install() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        $prefix = $wpdb->prefix . 'unclutter_';
        
        // Create tables only if they don't exist
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        // Accounts Table
        $sql_accounts = "CREATE TABLE IF NOT EXISTS {$prefix}finance_accounts (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            profile_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(100) NOT NULL,
            type_id BIGINT UNSIGNED NOT NULL,
            balance DECIMAL(15,2) DEFAULT 0.00,
            description TEXT,
            institution VARCHAR(100),
            is_active TINYINT(1) DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY profile_id (profile_id),
            KEY type_id (type_id)
        ) $charset_collate;";
        dbDelta($sql_accounts);
        
        // Categories Table (Unified taxonomy for account types, income/expense categories, tags, etc.)
        $sql_categories = "CREATE TABLE IF NOT EXISTS {$prefix}finance_categories (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            profile_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL, -- account_type, income, expense, tag, etc.
            parent_id BIGINT UNSIGNED DEFAULT NULL,
            description TEXT,
            is_active TINYINT(1) DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY profile_id (profile_id),
            KEY type (type),
            KEY parent_id (parent_id)
        ) $charset_collate;";
        dbDelta($sql_categories);
        
        // Transactions Table
        $sql_transactions = "CREATE TABLE IF NOT EXISTS {$prefix}finance_transactions (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            profile_id BIGINT UNSIGNED NOT NULL,
            account_id BIGINT UNSIGNED NOT NULL,
            category_id BIGINT UNSIGNED NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            transaction_date DATE NOT NULL,
            description VARCHAR(255),
            notes TEXT,
            type VARCHAR(20) NOT NULL, -- income, expense, transfer
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY profile_id (profile_id),
            KEY account_id (account_id),
            KEY category_id (category_id),
            KEY transaction_date (transaction_date),
            KEY type (type)
        ) $charset_collate;";
        dbDelta($sql_transactions);
        
        // Budgets Table
        $sql_budgets = "CREATE TABLE IF NOT EXISTS {$prefix}finance_budgets (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            profile_id BIGINT UNSIGNED NOT NULL,
            category_id BIGINT UNSIGNED NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            month INT(2) NOT NULL,
            year INT(4) NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY profile_id (profile_id),
            KEY category_id (category_id),
            UNIQUE KEY budget_period (profile_id, category_id, month, year)
        ) $charset_collate;";
        dbDelta($sql_budgets);
        
        // Goals Table
        $sql_goals = "CREATE TABLE IF NOT EXISTS {$prefix}finance_goals (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            profile_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(100) NOT NULL,
            target_amount DECIMAL(15,2) NOT NULL,
            current_amount DECIMAL(15,2) DEFAULT 0.00,
            start_date DATE NOT NULL,
            target_date DATE NOT NULL,
            description TEXT,
            account_id BIGINT UNSIGNED DEFAULT NULL,
            status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
            goal_type VARCHAR(20) DEFAULT 'fixed', -- fixed, percentage
            income_percentage DECIMAL(5,2) DEFAULT NULL, -- For percentage-based goals
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY profile_id (profile_id),
            KEY account_id (account_id),
            KEY status (status)
        ) $charset_collate;";
        dbDelta($sql_goals);
        
        // Transaction Tags (Many-to-Many)
        $sql_transaction_tags = "CREATE TABLE IF NOT EXISTS {$prefix}finance_transaction_tags (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            transaction_id BIGINT UNSIGNED NOT NULL,
            category_id BIGINT UNSIGNED NOT NULL, -- Using the unified categories table with type='tag'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY transaction_tag (transaction_id, category_id),
            KEY transaction_id (transaction_id),
            KEY category_id (category_id)
        ) $charset_collate;";
        dbDelta($sql_transaction_tags);
        
        // Transaction Attachments
        $sql_transaction_attachments = "CREATE TABLE IF NOT EXISTS {$prefix}finance_transaction_attachments (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            transaction_id BIGINT UNSIGNED NOT NULL,
            attachment_url VARCHAR(255) NOT NULL,
            attachment_type VARCHAR(50) DEFAULT 'receipt',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY transaction_id (transaction_id)
        ) $charset_collate;";
        dbDelta($sql_transaction_attachments);
        
        // Settings Table
        $sql_settings = "CREATE TABLE IF NOT EXISTS {$prefix}finance_settings (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            profile_id BIGINT UNSIGNED NOT NULL,
            setting_key VARCHAR(100) NOT NULL,
            setting_value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY profile_setting (profile_id, setting_key),
            KEY profile_id (profile_id)
        ) $charset_collate;";
        dbDelta($sql_settings);
        
        // Insert default categories
        self::insert_default_categories();
    }
    
    /**
     * Insert default categories
     */
    private static function insert_default_categories() {
        global $wpdb;
        $prefix = $wpdb->prefix . 'unclutter_';
        $table = $prefix . 'finance_categories';
        
        // Default account types (system-wide, profile_id = 0)
        $default_account_types = [
            ['name' => 'Checking', 'type' => 'account', 'description' => 'Checking account'],
            ['name' => 'Savings', 'type' => 'account', 'description' => 'Savings account'],
            ['name' => 'Credit Card', 'type' => 'account', 'description' => 'Credit card account'],
            ['name' => 'Investment', 'type' => 'account', 'description' => 'Investment account'],
            ['name' => 'Loan', 'type' => 'account', 'description' => 'Loan account'],
            ['name' => 'Cash', 'type' => 'account', 'description' => 'Cash account']
        ];
        
        // Default income categories
        $default_income_categories = [
            ['name' => 'Salary', 'type' => 'income', 'description' => 'Regular employment income'],
            ['name' => 'Freelance', 'type' => 'income', 'description' => 'Freelance or contract work'],
            ['name' => 'Interest', 'type' => 'income', 'description' => 'Interest income from investments'],
            ['name' => 'Dividends', 'type' => 'income', 'description' => 'Dividend income from investments'],
            ['name' => 'Gifts', 'type' => 'income', 'description' => 'Money received as gifts']
        ];
        
        // Default expense categories
        $default_expense_categories = [
            ['name' => 'Housing', 'type' => 'expense', 'description' => 'Rent, mortgage, property taxes'],
            ['name' => 'Utilities', 'type' => 'expense', 'description' => 'Electricity, water, gas, internet'],
            ['name' => 'Groceries', 'type' => 'expense', 'description' => 'Food and household supplies'],
            ['name' => 'Transportation', 'type' => 'expense', 'description' => 'Gas, public transit, car maintenance'],
            ['name' => 'Dining Out', 'type' => 'expense', 'description' => 'Restaurants, cafes, takeout'],
            ['name' => 'Entertainment', 'type' => 'expense', 'description' => 'Movies, events, subscriptions'],
            ['name' => 'Healthcare', 'type' => 'expense', 'description' => 'Medical expenses, insurance'],
            ['name' => 'Education', 'type' => 'expense', 'description' => 'Tuition, books, courses'],
            ['name' => 'Shopping', 'type' => 'expense', 'description' => 'Clothing, electronics, personal items'],
            ['name' => 'Travel', 'type' => 'expense', 'description' => 'Vacations, trips, hotels']
        ];
        
        // Insert account types
        foreach ($default_account_types as $account_type) {
            // Check if exists first
            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM $table WHERE profile_id = 0 AND name = %s AND type = %s",
                $account_type['name'],
                $account_type['type']
            ));
            
            if (!$exists) {
                $wpdb->insert(
                    $table,
                    [
                        'profile_id' => 0, // System-wide
                        'name' => $account_type['name'],
                        'type' => $account_type['type'],
                        'description' => $account_type['description'],
                        'is_active' => 1,
                        'created_at' => current_time('mysql'),
                        'updated_at' => current_time('mysql')
                    ]
                );
            }
        }
        
        // Insert income categories
        foreach ($default_income_categories as $category) {
            // Check if exists first
            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM $table WHERE profile_id = 0 AND name = %s AND type = %s",
                $category['name'],
                $category['type']
            ));
            
            if (!$exists) {
                $wpdb->insert(
                    $table,
                    [
                        'profile_id' => 0, // System-wide
                        'name' => $category['name'],
                        'type' => $category['type'],
                        'description' => $category['description'],
                        'is_active' => 1,
                        'created_at' => current_time('mysql'),
                        'updated_at' => current_time('mysql')
                    ]
                );
            }
        }
        
        // Insert expense categories
        foreach ($default_expense_categories as $category) {
            // Check if exists first
            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM $table WHERE profile_id = 0 AND name = %s AND type = %s",
                $category['name'],
                $category['type']
            ));
            
            if (!$exists) {
                $wpdb->insert(
                    $table,
                    [
                        'profile_id' => 0, // System-wide
                        'name' => $category['name'],
                        'type' => $category['type'],
                        'description' => $category['description'],
                        'is_active' => 1,
                        'created_at' => current_time('mysql'),
                        'updated_at' => current_time('mysql')
                    ]
                );
            }
        }
    }
}
