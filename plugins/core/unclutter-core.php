<?php
/**
 * Plugin Name: Unclutter Core
 * Description: Core plugin for user management, authentication, subscriptions, preferences, notifications, logging, and i18n for the Unclutter platform.
 * Version: 0.1.0
 * Author: Unclutter Team
 */

if (!defined('ABSPATH')) exit; // Exit if accessed directly

// Autoload DB installer early for activation hook
require_once plugin_dir_path(__FILE__) . 'includes/install/class-unclutter-db-installer.php';
// Autoload core classes
require_once plugin_dir_path(__FILE__) . 'includes/class-unclutter-core-loader.php';

// Register activation hook for DB installer
register_activation_hook(__FILE__, ['Unclutter_DB_Installer', 'install']);

// Initialize the plugin
add_action('plugins_loaded', ['Unclutter_Core_Loader', 'init']);
