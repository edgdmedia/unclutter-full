<?php
/**
 * Plugin Name: Unclutter Finance
 * Plugin URI: https://unclutter.com/finance
 * Description: Personal finance management plugin for the Unclutter platform.
 * Version: 1.0.0
 * Author: Unclutter Team
 * Text Domain: unclutter-finance
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) exit; // Exit if accessed directly

// Define plugin constants
define('UNCLUTTER_FINANCE_VERSION', '1.0.0');
define('UNCLUTTER_FINANCE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UNCLUTTER_FINANCE_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include the main plugin loader class
require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/class-unclutter-finance-loader.php';

/**
 * Main plugin initialization
 */
function unclutter_finance_init() {
    // Check if Unclutter Core is active
    if (!class_exists('Unclutter_Core_Loader')) {
        add_action('admin_notices', 'unclutter_finance_core_missing_notice');
        return;
    }
    
    // Initialize the plugin
    Unclutter_Finance_Loader::init();
}
add_action('plugins_loaded', 'unclutter_finance_init');

/**
 * Admin notice for missing Unclutter Core dependency
 */
function unclutter_finance_core_missing_notice() {
    echo '<div class="error"><p>';
    echo __('Unclutter Finance requires Unclutter Core plugin to be installed and activated.', 'unclutter-finance');
    echo '</p></div>';
}

/**
 * Plugin activation hook
 */
function unclutter_finance_activate() {
    // Require the installer class
    require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/install/class-unclutter-finance-db-installer.php';
    
    // Run the installer
    Unclutter_Finance_DB_Installer::install();
}
register_activation_hook(__FILE__, 'unclutter_finance_activate');

/**
 * Plugin deactivation hook
 */
function unclutter_finance_deactivate() {
    // Cleanup tasks if needed
}
register_deactivation_hook(__FILE__, 'unclutter_finance_deactivate');
