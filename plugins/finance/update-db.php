<?php
// Simple script to run the database updater

// Define ABSPATH to prevent direct access check from failing
if (!defined('ABSPATH')) {
    define('ABSPATH', dirname(dirname(dirname(__DIR__))) . '/');
}

// Include the database updater class
require_once __DIR__ . '/includes/install/class-unclutter-finance-db-updater.php';

// Run the update
Unclutter_Finance_DB_Updater::update();

echo "Database update completed successfully!\n";
