<?php
/**
 * Plugin Name: Unclutter Core
 * Description: Core plugin for user management, authentication, subscriptions, preferences, notifications, logging, and i18n for the Unclutter platform.
 * Version: 0.1.0
 * Author: Unclutter Team
 */

if (!defined('ABSPATH')) exit; // Exit if accessed directly

// add cors headers Access to fetch at 'https://dash.unclutter.com.ng/wp-json/api/v1/auth/login' from origin 'http://192.168.100.149:8081' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.

add_action('init', function () {
    $allowed_origins = [
        'http://localhost:8081',
        'http://192.168.100.149:8081',
        'https://dash.unclutter.com.ng',
        'https://finance.unclutter.com.ng',
        'https://unclutter.com.ng'
    ];
    
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
    }
});

// Autoload DB installer early for activation hook
require_once plugin_dir_path(__FILE__) . 'includes/install/class-unclutter-db-installer.php';
// Autoload core classes
require_once plugin_dir_path(__FILE__) . 'includes/class-unclutter-core-loader.php';

// Register activation hook for DB installer
register_activation_hook(__FILE__, ['Unclutter_DB_Installer', 'install']);

// Initialize the plugin
add_action('plugins_loaded', ['Unclutter_Core_Loader', 'init']);
